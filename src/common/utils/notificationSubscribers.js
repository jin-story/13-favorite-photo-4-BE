const clients = new Map();

function addSubscriber(userId, response) {
  clients.set(userId, response);
}

function removeSubscriber(userId, response) {
  const currentSubscriber = clients.get(userId);

  if (currentSubscriber === response) {
    clients.delete(userId);
  }
}

function sendNotification(userId, notification) {
  const subscriber = clients.get(userId);

  if (!subscriber) {
    return;
  }

  subscriber.write(`data: ${JSON.stringify(notification)}\n\n`);
}

export { addSubscriber, removeSubscriber, sendNotification };
