class ESIndex:
    """
    A class to represent an Elasticsearch index configuration.
    """
    def __init__(self, mapping_type, index_name, dimensions):
        """
        Initializes the ESIndex object with mapping details.

        Args:
            mapping_type (str): The type of mapping for the index.
            index_name (str): The name of the Elasticsearch index.
            dimensions (int): The number of dimensions for vector search.
        """
        self.__mapping_type = mapping_type
        self.__index_name = index_name
        self.__dimensions = dimensions

    def __str__(self):
        """
        Returns a human-readable string representation of the ESIndex object.
        """
        return (f"ESIndex(index_name='{self.__index_name}', "
                f"mapping_type='{self.__mapping_type}', "
                f"dimensions={self.__dimensions})")

    def get_mapping_type(self):
        """
        Returns the mapping type of the index.
        """
        return self.__mapping_type

    def get_index_name(self):
        """
        Returns the name of the Elasticsearch index.
        """
        return self.__index_name

    def get_dimensions(self):
        """
        Returns the number of dimensions for vector search.
        """
        return self.__dimensions

