import threading
import time
import sys
from azure_message_broker import MessageBroker


class QueueCleaner(threading.Thread):
    def __init__(self):
        threading.Thread.__init__(self)
        self.broker: MessageBroker = MessageBroker()

        self.poll_for_message_worker_thread = threading.Thread(target=self.poll_for_message_worker, daemon=True)

    def poll_for_message_worker(self):
        while True:
            foo = self.broker.get_queues()
            for queue in foo:
                if queue.name == "message-generator" or queue.name == "submission-lock" or queue.name == "chat-input" or queue.name == "chat-output" or queue.name == "submission-generator":
                    continue
                else:
                    print(queue.name)
                    self.broker.delete_queue(queue.name)
            time.sleep(60 * 60 * 1)

    def run(self):
        self.poll_for_message_worker_thread.start()

    def stop(self):
        sys.exit(0)