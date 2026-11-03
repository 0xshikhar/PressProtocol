<?php

/**
 * Local Ed25519 signing for PressProtocol (signature protocol v2).
 *
 * The private key never leaves WordPress: it is generated with libsodium, stored encrypted
 * (XSalsa20-Poly1305 secretbox keyed from the SECURE_AUTH salt in wp-config.php), and only
 * the public key and detached signature are sent to the publishing API.
 */
class AnonPress_Signer {
    const PROTOCOL = 'pressprotocol/sig/v2';
    const KEY_OPTION = 'pressprotocol_signing_key';
    const LEGACY_KEY_OPTION = 'anonpress_private_key';
    const PUBLIC_KEY_OPTION = 'anonpress_public_key';

    /**
     * Returns the site signing keypair as raw libsodium keys, creating one on first use.
     *
     * @return array{secret: string, public: string}
     */
    public static function get_keypair() {
        $stored = get_option(self::KEY_OPTION);
        if (is_array($stored) && !empty($stored['nonce']) && !empty($stored['box'])) {
            $seed = sodium_crypto_secretbox_open(base64_decode($stored['box']), base64_decode($stored['nonce']), self::storage_key());
            if ($seed !== false && strlen($seed) === SODIUM_CRYPTO_SIGN_SEEDBYTES) {
                return self::keypair_from_seed($seed);
            }
        }

        $legacy_hex = get_option(self::LEGACY_KEY_OPTION);
        $seed = (is_string($legacy_hex) && preg_match('/^[0-9a-fA-F]{64}$/', $legacy_hex))
            ? hex2bin($legacy_hex)
            : random_bytes(SODIUM_CRYPTO_SIGN_SEEDBYTES);

        $keypair = self::keypair_from_seed($seed);
        $nonce = random_bytes(SODIUM_CRYPTO_SECRETBOX_NONCEBYTES);
        update_option(self::KEY_OPTION, array(
            'nonce' => base64_encode($nonce),
            'box' => base64_encode(sodium_crypto_secretbox($seed, $nonce, self::storage_key())),
        ), false);
        update_option(self::PUBLIC_KEY_OPTION, bin2hex($keypair['public']));
        delete_option(self::LEGACY_KEY_OPTION);

        return $keypair;
    }

    public static function get_public_key_hex() {
        $keypair = self::get_keypair();
        return bin2hex($keypair['public']);
    }

    /**
     * Signs an article with the v2 canonical payload and returns the detached signature as hex.
     */
    public static function sign_article($title, array $tags, $timestamp, $content) {
        $keypair = self::get_keypair();
        $message = self::build_signing_payload($title, $tags, $timestamp, $content);
        return bin2hex(sodium_crypto_sign_detached($message, $keypair['secret']));
    }

    /**
     * RFC 8785 canonical JSON of the v2 payload (keys sorted, no insignificant whitespace).
     */
    public static function build_signing_payload($title, array $tags, $timestamp, $content) {
        return self::canonicalize(array(
            'proto' => self::PROTOCOL,
            'title' => (string) $title,
            'tags' => array_values(array_map('strval', $tags)),
            'timestamp' => (string) $timestamp,
            'contentSha256' => hash('sha256', (string) $content),
        ));
    }

    private static function canonicalize($value) {
        if (is_array($value) && array_keys($value) !== range(0, count($value) - 1) && count($value) > 0) {
            ksort($value, SORT_STRING);
            $pairs = array();
            foreach ($value as $key => $item) {
                $pairs[] = self::encode_string((string) $key) . ':' . self::canonicalize($item);
            }
            return '{' . implode(',', $pairs) . '}';
        }
        if (is_array($value)) {
            return '[' . implode(',', array_map(array(__CLASS__, 'canonicalize'), $value)) . ']';
        }
        return self::encode_string((string) $value);
    }

    private static function encode_string($value) {
        return json_encode($value, JSON_UNESCAPED_SLASHES | JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_LINE_TERMINATORS);
    }

    private static function keypair_from_seed($seed) {
        $keypair = sodium_crypto_sign_seed_keypair($seed);
        return array(
            'secret' => sodium_crypto_sign_secretkey($keypair),
            'public' => sodium_crypto_sign_publickey($keypair),
        );
    }

    private static function storage_key() {
        return sodium_crypto_generichash('pressprotocol-signing-key|' . wp_salt('secure_auth'), '', SODIUM_CRYPTO_SECRETBOX_KEYBYTES);
    }
}
