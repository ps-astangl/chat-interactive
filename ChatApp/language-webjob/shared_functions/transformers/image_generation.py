import gc
import hashlib
import logging
import random
from typing import Optional

import torch
from diffusers import StableDiffusionPipeline


class ImageGenerator(object):
    def __init__(self):
        self.model_path = "/models/StableDiffusionPipeline"

    def create_image(self, prompt: str) -> Optional[str]:
        try:
            pipe: StableDiffusionPipeline = StableDiffusionPipeline.from_pretrained(self.model_path, revision="fp16",
                                                                                    torch_dtype=torch.float16,
                                                                                    safety_checker=None)

            pipe = pipe.to("cuda")

            image = \
                pipe(prompt, guidance_scale=random.randint(7, 12), num_inference_steps=75, height=512,
                     width=768).images[0]

            image_path = "/images/" + hashlib.md5(prompt.encode()).hexdigest() + ".png"

            image.save(image_path)

            return image_path

        except Exception as e:
            logging.info("Failed to generate image")
            return None

        finally:
            logging.info("Image generated successfully!")
            try:
                torch.cuda.empty_cache()
                gc.collect()

            except Exception as e:
                logging.info("Failed to empty cache")
                gc.collect()