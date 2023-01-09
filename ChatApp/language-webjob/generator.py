import json
import logging
import sys
import threading
import time
from multiprocessing import Process
from azure.storage.queue import QueueMessage
from shared_functions.azure.azure_message_broker import MessageBroker
from shared_functions.azure.azure_queue_cleaner import QueueCleaner
from shared_functions.azure.azure_blob_broker import BlobBroker
from shared_functions.transformers.lanuage_generation import LangaugeGenerator
from shared_functions.transformers.image_generation import ImageGenerator

MAT_PROC_SLEEP: int = 1

logging.getLogger("azure.storage").setLevel(logging.WARNING)


class ProcessManager(threading.Thread):
    def __init__(self, proc_name: str):
        super().__init__(name=proc_name, daemon=True)
        self.poll_for_message_worker_thread = threading.Thread(target=self.poll_for_reply_queue, args=(), daemon=True,name=proc_name)
        self.message_broker_instance: MessageBroker = MessageBroker()

    @staticmethod
    def reply_to_thing(q: dict):
        message_broker_instance:MessageBroker = MessageBroker()
        image_generator:ImageGenerator = ImageGenerator()

        print(f"Got reply: {q}")
        data_dict = q
        text = data_dict.get("Text")
        prompt = data_dict.get("Prompt")
        sender = data_dict.get("Sender")
        topic = data_dict.get("Topic")
        channel = data_dict.get("Channel")
        comment_id = data_dict.get("CommentId")
        connection_id = data_dict.get("ConnectionId")
        out_queue = data_dict.get("ConnectionId")
        try:
            langauge_generator = LangaugeGenerator(sender)
            if sender == "ImageBot":
                local_image_path = image_generator.create_image(prompt)
                if local_image_path is not None:
                    with open(local_image_path, "rb") as f:
                        image_data = f.read()
                        BlobBroker(container_name='images', blob_name=local_image_path).upload_blob(image_data)
                        print("https://ajdevreddit.blob.core.windows.net/images" + local_image_path)
                        reply = "https://ajdevreddit.blob.core.windows.net/images" + local_image_path
            else:
                reply = langauge_generator.generate_response(prompt, topic, channel)
                reply = reply.replace("<|eor|>", "")
                reply = reply.replace("<|eoss|>", "")
            print(reply)
        except Exception as e:
            print(f"Error generating reply: {e}")
            reply = "I'm sorry, I'm not feeling well today. I'll be back later."
            pass

        out_put = json.dumps(
            {
                "text": reply,
                "prompt": prompt,
                "sender": sender,
                "commentId": comment_id,
                "topic": topic,
                "connectionId": connection_id,
                "isBot": True,
                "isThinking": False,
                "channel": channel
            }
        )
        try:
            print(f"Sending reply: {out_put}")
            message_broker_instance.put_message(out_queue, out_put)
        except:
            print(f"Error putting message on queue: {out_queue}")

    time.sleep(MAT_PROC_SLEEP)

    def poll_for_reply_queue(self):
        while True:
            try:
                message: QueueMessage = self.message_broker_instance.get_message("chat-input")
                if message is not None:
                    q = json.loads(message.content)
                    p = Process(target=self.reply_to_thing, args=(q,), daemon=True)
                    p.start()
                    self.message_broker_instance.delete_message("chat-input", message)
                    p.join()
            finally:
                time.sleep(MAT_PROC_SLEEP)

    def run(self):
        self.poll_for_message_worker_thread.start()

    def stop(self):
        sys.exit(0)


if __name__ == '__main__':
    procs = []
    for i in range(0, 6):
        proc = ProcessManager(f"ProcessManager-{i}").start()
        procs.append(proc)

    cleaner = QueueCleaner().start()
    procs.append(cleaner)

    try:
        while True:
            time.sleep(MAT_PROC_SLEEP)
    except KeyboardInterrupt:
        logging.info('Shutdown')
        map(lambda x: x.stop(), procs)
        exit(0)