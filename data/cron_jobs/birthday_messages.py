import os
import json
import requests
import logging


API_ENDPOINT = os.environ.get('SERVER_ADDRESS', '') + "/api/v1/scheduler/birthday/messages"
CRONJOB_NAME = ' '.join(x.capitalize() or '_' for x in os.path.splitext(os.path.basename(__file__))[0].split('_'))
SLACK_WEBHOOK = os.environ.get('ERROR_WEBHOOK_URL', '')
LOGGER_FILE_PATH = "logs/{}.log".format(os.path.splitext(os.path.basename(__file__))[0])
ACCESS_TOKEN = os.environ.get('CRONJOB_ACCESS_TOKEN', '')


# Create log folder if not exists
if not os.path.exists('logs'):
    os.makedirs('logs')


# Configure logger
logging.basicConfig(
    filename=LOGGER_FILE_PATH,
    level=logging.INFO,
    format='%(asctime)s | %(levelname)s | line-%(lineno)d | %(message)s',
    datefmt='%Y-%m-%d %H:%M:%S',
)
logger = logging.getLogger()
handler = logging.FileHandler(LOGGER_FILE_PATH)
logger.addHandler(handler)


def notify_in_slack(payload):
	"""
	Send notification to slack

	Args:
		payload (dict): Payload to be sent in the notification
	"""

	payload = {
	"text": json.dumps(payload)
	}
	headers = {
	  "Content-Type": "application/json"
	}
	requests.request("POST", SLACK_WEBHOOK, headers=headers, data=json.dumps(payload))


def call_api():
	"""
	Call ClearVue API for sending automated messages
	"""

	headers = {
	  "Authorization": ACCESS_TOKEN,
	  "Content-Type": "application/json"
	}
	response = requests.request("POST", API_ENDPOINT, headers=headers)
	if response.status_code != 200:
		log_details = {
			"cron_name": CRONJOB_NAME,
			"message": "API invocation failed.",
			"error": response.text,
			"status_code": response.status_code
		}
		logger.error("API call failed. Details: {}".format(log_details))
		notify_in_slack(log_details)
		return

	logger.info("API called successfully. Status-code: {}, API Response: {}".format(response.status_code, response.text))


if __name__ == '__main__':
	try:
		logger.info("Request Starts")
		call_api()
		logger.info("Request Ends")
	except Exception as e:
		log_details = {
			"cron_name": CRONJOB_NAME,
			"message": "Error occured in script execution.",
			"error": str(e)
		}
		logger.error(json.dumps(log_details))
		notify_in_slack(log_details)
