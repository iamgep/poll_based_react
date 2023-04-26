import json
import boto3

dynamodb = boto3.resource('dynamodb')
table = dynamodb.Table('your_polls_table_name')

def lambda_handler(event, context):
    resource = event['resource']
    http_method = event['httpMethod']

    if resource == '/polls':
        if http_method == 'GET':
            return get_all_polls()
        elif http_method == 'POST':
            return create_poll(event)
    elif resource == '/polls/{id}':
        if http_method == 'GET':
            return get_poll_by_id(event)
        elif http_method == 'PUT':
            return update_poll_by_id(event)

    return {
        'statusCode': 400,
        'body': json.dumps({'message': 'Invalid resource or method.'})
    }

from uuid import uuid4

def get_all_polls():
    response = table.scan()
    polls = response['Items']

    return {
        'statusCode': 200,
        'body': json.dumps(polls)
    }

def create_poll(event):
    poll_data = json.loads(event['body'])

    poll = {
        'id': str(uuid4()),
        'question': poll_data['question'],
        'options': poll_data['options'],
        'votes': [0] * len(poll_data['options'])
    }

    table.put_item(Item=poll)

    return {
        'statusCode': 201,
        'body': json.dumps(poll)
    }

def get_poll_by_id(event):
    poll_id = event['pathParameters']['id']

    response = table.get_item(Key={'id': poll_id})

    if 'Item' not in response:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'Poll not found'})
        }

    return {
        'statusCode': 200,
        'body': json.dumps(response['Item'])
    }

def update_poll_by_id(event):
    poll_id = event['pathParameters']['id']
    update_data = json.loads(event['body'])

    if 'option_index' not in update_data:
        return {
            'statusCode': 400,
            'body': json.dumps({'message': 'Invalid input'})
        }

    option_index = update_data['option_index']

    # Update the poll's vote count for the selected option
    response = table.update_item(
        Key={'id': poll_id},
        UpdateExpression="ADD votes[{}]:incr".format(option_index),
        ExpressionAttributeValues={":incr": 1},
        ReturnValues="UPDATED_NEW"
    )

    if 'Attributes' not in response:
        return {
            'statusCode': 404,
            'body': json.dumps({'message': 'Poll not found'})
        }

    return {
        'statusCode': 200,
        'body': json.dumps(response['Attributes'])
    }
