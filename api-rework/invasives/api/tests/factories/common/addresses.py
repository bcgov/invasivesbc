import random


def build_postal_code():
    LETTERS = "ABCEGHJNPRSTVXY"

    def l():
        return LETTERS[random.randrange(0, len(LETTERS))]

    def d():
        return random.randrange(0, 9)

    return f"{l()}{d()}{l()}{d()}{l()}{d()}"
