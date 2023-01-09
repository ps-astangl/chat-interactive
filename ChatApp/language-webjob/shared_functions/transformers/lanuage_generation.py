from simpletransformers.language_generation import LanguageGenerationModel


class LangaugeGenerator(object):
    sender_map = {
        "Laura": f"D:\models\GusterIs4Lovers",
        "Kimmie": f"D:\models\Kimmie-v2",
        "Spez": f"D:\models\spez",
        "SportsFan": f"D:\models\SportsFanBotGhostGPT",
        "PoetBot": f"D:\models\PoetBot",
        "Yuli": f"D:\models\yuli-ban-2",
        "Nick": f"D:\models\The_JSQuareD",
        "CoopBot": f"D:\models\mega_pablo_bot",
        "PabloBot": f"D:\models\PabloBot",
        "Susan": f"D:\models\large_flightattentdent_bot",
        "ImageBot": f"D:\models\StableDiffusionPipeline",
    }

    def __init__(self, bot_name: str):
        self.model_path = self.sender_map.get(bot_name)

    def generate_response(self, input_prompt, message_topic, message_channel) -> str:
        text_model_generator = LanguageGenerationModel("gpt2", self.model_path, args={
            'max_length': 1024,
            'num_return_sequences': 1,
            'repetition_penalty': 1.01,
            'stop_token': '<|endoftext|>',
            'temperature': 0.8,
            'top_k': 40,
        }, use_cuda=True)
        prompt = f"<|soss r/{message_channel}|><|sot|>{message_topic}<|eot|><|sost|>{input_prompt}<|eost|><|sor|>"
        ###
        # <|soss r/Topic|><|sot|>Tutorial On Topics<|eot|><|sost|>Some Topic Title<|eost|><|sor u/User|>User Reply<|eor|><|sor|>...Bot Autogenerates the rest of the text"
        ###

        reply = None
        refresh_args = {
            'max_length': 1024,
            'num_return_sequences': 1,
            'repetition_penalty': 1.01,
            'stop_token': '<|endoftext|>',
            'temperature': 0.8,
            'top_k': 40,
        }
        while reply is None:
            for text in text_model_generator.generate(prompt=prompt, args=refresh_args, verbose=False):
                result = text.replace(prompt, "\n")
                if result is not None:
                    reply = result
                    break
        print(f"Reply: {reply}")
        return reply