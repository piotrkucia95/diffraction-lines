class Calculation:
    def __init__(self, id, element_a, element_b, n_a, m_b, n, w_a, w_b, g_a, g_b, t2_min, t2_max, standard, date):
        self.id = id
        self.elementA = element_a
        self.elementB = element_b
        self.nA = n_a
        self.mB = m_b
        self.n = n
        self.wA = w_a
        self.wB = w_b
        self.gA = g_a
        self.gB = g_b
        self.theta2Min = t2_min
        self.theta2Max = t2_max
        self.standard = standard
        self.createdDate = date