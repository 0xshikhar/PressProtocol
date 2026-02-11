#!/bin/bash

# Test Article API Response
echo "🔍 Testing Article API Response"
echo "================================"
echo ""

# Get the CID from the URL (Article 104)
CID="QmdAJAwArjTDSi2L8X8M85x6FJrgMmYUt9y2kJhCETWix"

echo "📋 CID: $CID"
echo ""

echo "📡 Backend Response:"
echo "-------------------"
curl -s "http://localhost:4000/api/content/$CID" | jq '{
  cid: .data.cid,
  title: .data.title,
  mirrors: .data.mirrors,
  recommended: .data.recommended
}'

echo ""
echo ""
echo "🧅 Tor Mirror Specific:"
echo "----------------------"
curl -s "http://localhost:4000/api/content/$CID" | jq '.data.mirrors.tor'

echo ""
