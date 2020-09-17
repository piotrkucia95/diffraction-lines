from element import Element
from calculation import Calculation
import psycopg2
import uuid
import datetime 
from configparser import ConfigParser

class Database:
    def __init__(self):  
        self.params = self.config()

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
        query = 'SELECT * FROM elements WHERE LOWER(display_name) LIKE LOWER(%s)'
        search_term = '%' + search_term + '%'
        conn = psycopg2.connect(**self.params)
        cur = conn.cursor()
        cur.execute(query, (search_term,))
        results = cur.fetchall()
        cur.close()
        conn.close()
        elements = []
        for r in results:
            element = Element(r[0], r[1], r[2], r[3], r[4])
            elements.append(element.__dict__)
        return elements

    def add_element(self, el):
        query = """ INSERT INTO elements(name, symbol, dhkl, display_name, id) 
                    VALUES (%s, %s, %s, %s, %s) """
        el_id = uuid.uuid4()
        conn = psycopg2.connect(**self.params)
        cur = conn.cursor()
        cur.execute(query, (el.name, el.symbol, el.dhkl, el.display_name, str(el_id)),)
        conn.commit()
        cur.close()
        conn.close()

    def save_calculation(self, calc):
        query = """ INSERT INTO calculations(id, advanced, element_a_id, element_b_id, n_a, m_b, n, w_a, w_b, g_a, g_b, theta_2_min, theta_2_max, d_a_custom, d_b_custom, lambda, standard_error) 
                    VALUES (%s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s, %s) """
        conn = psycopg2.connect(**self.params)
        cur = conn.cursor()
        calc_id = uuid.uuid4()
        cur.execute(query, (str(calc_id), calc.advanced, calc.element_a.id, calc.element_b.id, calc.n_a, calc.m_b, calc.n, calc.w_a, 
                            calc.w_b, calc.g_a, calc.g_b, calc.theta_2_min, calc.theta_2_max, calc.d_a_custom, calc.d_b_custom, calc.lambda_length, calc.standard_error),)
        conn.commit()
        cur.close()
        conn.close()

    def get_calculations(self, advanced):
        query = """ SELECT * FROM calculations 
                    LEFT JOIN elements el_a ON calculations.element_a_id = el_a.id 
                    LEFT JOIN elements el_b ON calculations.element_b_id = el_b.id """
        if advanced == 'false':
            query += 'WHERE advanced = false '
        query += 'ORDER BY created_date DESC LIMIT 100 '

        conn = psycopg2.connect(**self.params)
        cur = conn.cursor()
        cur.execute(query, ())
        results = cur.fetchall()
        cur.close()
        conn.close()

        calculations = []

        for r in results:
            el_a = Element(r[18], r[19], r[20], r[21], r[22])
            el_b = Element(r[23], r[24], r[25], r[26], r[27])
            calc = Calculation(r[0], r[12], el_a.__dict__, el_b.__dict__, r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[13], r[14], r[15], r[16], r[17])
            calculations.append(calc.__dict__)

        return calculations

    def update_calculation(self, id):
        query = """ WITH updated AS (
                        UPDATE calculations SET created_date = %s WHERE id = %s RETURNING *
                    )
                    SELECT updated.*, el_a.*, el_b.*
                    FROM updated
                    LEFT JOIN elements el_a ON updated.element_a_id = el_a.id 
                    LEFT JOIN elements el_b ON updated.element_b_id = el_b.id """
        conn = psycopg2.connect(**self.params)
        cur = conn.cursor()
        cur.execute(query, (datetime.datetime.now(), id))
        r = cur.fetchone()
        cur.close()
        conn.close()

        el_a = Element(r[18], r[19], r[20], r[21], r[22])
        el_b = Element(r[23], r[24], r[25], r[26], r[27])
        calc = Calculation(r[0], r[12], el_a, el_b, r[3], r[4], r[5], r[6], r[7], r[8], r[9], r[10], r[11], r[13], r[14], r[15], r[16], r[17])

        return calc

    def delete_calculation(self, id):
        query = 'DELETE FROM calculations WHERE id = %s'
        conn = psycopg2.connect(**self.params)
        cur = conn.cursor()
        cur.execute(query, (str(id),))
        cur.close()
        conn.close()