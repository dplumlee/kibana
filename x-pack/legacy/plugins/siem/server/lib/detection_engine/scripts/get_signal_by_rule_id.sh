#!/bin/sh

#
# Copyright Elasticsearch B.V. and/or licensed to Elasticsearch B.V. under one
# or more contributor license agreements. Licensed under the Elastic License;
# you may not use this file except in compliance with the Elastic License.
#

set -e
./check_env_variables.sh

# Example: ./get_signal_by_rule_id.sh {rule_id}
curl -s -k \
 -u ${ELASTICSEARCH_USERNAME}:${ELASTICSEARCH_PASSWORD} \
 -X GET ${KIBANA_URL}/api/detection_engine/rules?rule_id="$1" | jq .
