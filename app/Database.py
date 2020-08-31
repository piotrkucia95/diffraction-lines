from Element import Element
from Calculation import Calculation
import psycopg2
import uuid
import datetime 
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

    def get_element(self, id):
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM elements WHERE id = %s', (id,))
        results = cur.fetchall()
        cur.close()
        return result

    def search_elements(self, search_term):
        search_term = '%' + search_term + '%'
        cur = self.conn.cursor()
        cur.execute('SELECT * FROM elements WHERE LOWER(display_name) LIKE LOWER(%s)', (search_term,))
        results = cur.fetchall()
        cur.close()
        elements = []
        for r in results:
            element = Element(r[0], r[1], r[2], r[3], r[4])
            elements.append(element.__dict__)
        return elements

    def save_calculations(self, params):
        cur = self.conn.cursor()
        calc_id = uuid.uuid4()
        query = """INSERT INTO calculations(id, element_a_id, element_b_id, n_a, m_b, n, w_a, w_b, g_a, g_b, theta_2_min, theta_2_max, standard) 
                   VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s)"""
        cur.execute(query, (str(calc_id), params['elementAId'], params['elementBId'], params['nA'], params['mB'], params['n'],
                            params['wA'], params['wB'], params['gA'], params['gB'], params['theta2Min'], params['theta2Max'], False),)
        self.conn.commit()
        cur.close()

    def get_calculations(self):
        cur = self.conn.cursor()
        query = """
                    SELECT * FROM calculations 
                    JOIN elements el_a ON calculations.element_a_id = el_a.id 
                    JOIN elements el_b ON calculations.element_b_id = el_b.id 
                    ORDER BY created_date DESC LIMIT 100
                """
        cur.execute(query, ())
        results = cur.fetchall()
        cur.close()

        calculations = []

        for r in results:
            el_a = Element(r[14], r[15], r[16], r[17], r[18])
            el_b = Element(r[19], r[20], r[21], r[22], r[23])
            calc = Calculation(r[0], el_a.__dict__, el_b.__dict__, r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13])
            calculations.append(calc.__dict__)

        return calculations

    def update_calculation(self, id):
        cur = self.conn.cursor()
        # query = """UPDATE calculations SET created_date = %s 
        #         FROM (
        #                 SELECT * FROM calculations
        #                 WHERE id = %s
        #                 FOR UPDATE
        #             ) sub
        #             JOIN elements el_a ON sub.element_a_id = el_a.id 
        #             JOIN elements el_b ON sub.element_b_id = el_b.id 
        #         WHERE id = %s
        #         RETURNING mytable.mycolumn, j.othercolumn"""

        query = """
                    WITH updated AS (
                        UPDATE calculations SET created_date = %s WHERE id = %s RETURNING *
                    )
                    SELECT updated.*, el_a.*, el_b.*
                    FROM updated
                    JOIN elements el_a ON updated.element_a_id = el_a.id 
                    JOIN elements el_b ON updated.element_b_id = el_b.id
                """

        cur.execute(query, (datetime.datetime.now(), id))
        r = cur.fetchone()
        cur.close()

        el_a = Element(r[14], r[15], r[16], r[17], r[18])
        el_b = Element(r[19], r[20], r[21], r[22], r[23])
        calc = Calculation(r[0], el_a.__dict__, el_b.__dict__, r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[12], r[13])

        return calc.__dict__