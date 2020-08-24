import psycopg2
from configparser import ConfigParser

class Database:
    def __init__(self):  
        params = self.config()
        self.conn = psycopg2.connect(**params)

    def config(self, filename='database.ini', section='postgresql'):
        parser = ConfigParser()
        parser.read(filename)

        db = {}
        if parser.has_section(section):
            params = parser.items(section)
            for param in params:
                db[param[0]] = param[1]
        else:
            raise Exception('Section {0} not found in the {1} file'.format(section, filename))

        return db

    def search_elements(self, search_term):
        search_term = '%' + search_term + '%'
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM elements WHERE LOWER(display_name) LIKE LOWER(%s)', (search_term,))
        results = cur.fetchall()
        cur.close()
        return results