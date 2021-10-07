#!/bin/bash

echo "Testing GET"
echo "############################################################"
curl -X GET localhost:3000/api/primates
echo ""
echo "############################################################"
echo "############################################################"
echo ""

echo "Testing GET primate"
curl -X GET localhost:3000/api/primates/Caesar
echo ""
echo "[{\"id\":1,\"name\":\"Caesar\",\"birthYear\":1999,\"sex\":1,\"species\":\"Chimpanzee\",\"zoo\":\"Brevard Zoo\"}] expected"
echo "############################################################"
echo "############################################################"
echo ""

echo "Testing POST Fred"
echo "############################################################"
curl -X POST --data "name=Fred&birthYear=1995&species=SpiderMonkey&sex=Male&zoo=StLouis" http://localhost:3000/api/primates
echo ""
echo "############################################################"
echo "############################################################"
echo ""

echo "Testing GET from prior POST"
echo "############################################################"
curl -X GET localhost:3000/api/primates/Fred
echo ""
echo "[{\"id\":??,\"name\":\"Fred\",\"birthYear\":1995,\"sex\":1,\"species\":\"SpiderMonkey\",\"zoo\":\"StLouis\"}] expected"
echo "############################################################"
echo "############################################################"
echo ""

echo "Testing PATCH on Fred"
echo "############################################################"
curl -X PATCH --data "patchList=[{\"op\":\"replace\",\"path\":\"species\",\"value\":\"Spider Monkey\"},{\"op\":\"replace\",\"path\":\"zoo\",\"value\":\"St Louis\"}]" localhost:3000/api/primates/Fred
#curl -X PATCH --data "patchList=[{\"op\":\"replace\",\"path\":\"species = SELECT CAST(SELECT * FROM primates AS tinytext)\",\"value\": \"dog\"}]" localhost:3000/api/primates/Fred
echo ""
echo "{\"message\":\"primate name: Fred updated\",\"location\":\"/api/Fred\"} expected"
echo "############################################################"
echo "############################################################"
echo ""

echo "Testing GET from prior PATCH"
echo "############################################################"
curl -X GET localhost:3000/api/primates/Fred
echo ""
echo "[{\"id:??\"\"name\":\"Fred\",\"birthYear\":1995,\"sex\":1,\"species\":\"Spider Monkey\",\"zoo\":\"StLouis\"}] expected"
echo "############################################################"
echo "############################################################"
echo ""

echo "Testing DELETE on Fred"
echo "############################################################"
curl -X DELETE localhost:3000/api/primates/Fred
echo ""
echo "############################################################"
echo "############################################################"
echo ""

echo "Testing GET from prior DELETE - No more Fred"
echo "############################################################"
curl -X GET localhost:3000/api/primates/Fred
echo ""
echo "{\"message\":\"Not Found\"} expected"
echo "############################################################"
echo "############################################################"
echo ""
