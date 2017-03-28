#!/usr/bin/env bash
cd $(dirname $0)
cd src
mkdir ../target
zip ../target/usable-kimai.zip *
