#!/bin/bash
ts-node -r tsconfig-paths/register ./node_modules/typeorm/cli.js -d ./src/data-source.ts migration:generate "$@"

