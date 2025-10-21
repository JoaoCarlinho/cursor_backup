class QueryPrompt:
    """
    A class to represent a query prompt configuration.
    """
    def __init__(
            self,
            prompt_text,
            prompt_model,
            instructions,
            additional_context="-",
            files=None
    ):
        """
        Initializes the QueryPrompt object with mapping details.

        Args:
            prompt_text (str): The text of the prompt.
            prompt_model (str): The model to be used for the prompt.
            intructions (str): Instructions for the prompt.
            additional_context (str, optional): Additional context for the prompt. Defaults to "-".
        """
        self.__prompt_text = prompt_text
        self.__prompt_model = prompt_model
        self.__instructions = instructions
        self.__additional_context = additional_context
        self.__files = files if files is not None else []

    def __str__(self):
        """
        Returns a human-readable string representation of the ESIndex object.
        """
        return (f"ESIndex(prompt_model='{self.__prompt_model}', "
                f"prompt_text='{self.__prompt_text}', "
                f"instructions={self.__instructions})")

    def get_prompt_text(self):
        """
        Returns the text of the prompt.
        """
        return self.__prompt_text

    def get_prompt_model(self):
        """
        Returns the model to be used for responding to the prompt.
        """
        return self.__prompt_model

    def get_instructions(self):
        """
        Returns the instructions for the prompt.
        """
        return self.__instructions
    
    def get_files(self):
        """ Returns the list of files associated with the prompt. """
        return self.__files

    def get_additional_context(self):
        """ Returns the additional context for the prompt. """
        return self.__additional_context

    def set_additional_context(self, additional_context):
        """ Sets the additional context for the prompt. """
        self.__additional_context = additional_context
        return self
