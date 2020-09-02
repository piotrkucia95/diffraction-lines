from element import Element

class Calculation:
    def __init__(self, id, element_a, element_b, n_a, m_b, n, w_a, w_b, g_a, g_b, t2_min, t2_max, standard, date):
        self.id = id
        self.element_a = element_a
        self.element_b = element_b
        self.n_a = n_a
        self.m_b = m_b
        self.n = n
        self.w_a = w_a
        self.w_b = w_b
        self.g_a = g_a
        self.g_b = g_b
        self.theta_2_min = t2_min
        self.theta_2_max = t2_max
        self.standard = standard
        self.created_date = date