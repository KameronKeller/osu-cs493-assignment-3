cd tests

declare -a environments=(
    "api_tests_no_login.postman_environment.json"
    "api_tests_normal_user.postman_environment.json"
    "api_tests_admin_user.postman_environment.json"
)

for environment in ${environments[@]}; do
    newman run -e $environment api_tests.postman_collection.json
done