#!/bin/bash

set -euo pipefail

source scripts/common.sh

STATE_post=true node src/index.js
