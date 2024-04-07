from typing import List
from enum import Enum


class Answer(Enum):
    NO = 0
    YES = 1


evan_ranked = [
    ["Victoria Square", Answer.NO.value, 99.99],
    ["Vieux-Port de Montréal", Answer.YES.value, 81.65],
    ["La Grande Roue de Montréal", Answer.YES.value, 70.71],
    ["Museum of Illusions Montréal", Answer.YES.value, 70.71],
    ["Le Vieux Montréal", Answer.YES.value, 70.71],
    ["Place des Arts", Answer.NO.value, 67.08],
    ["Cafe Depot", Answer.NO.value, 53.03],
    ["Trattoria Gio", Answer.YES.value, 50],
    ["Montreal City Hall", Answer.NO.value, 40.82],
    ["Maggie Oakes", Answer.YES.value, 28.86]
]

evans_mom_ranked = [
    ["16 Handles", Answer.NO.value, 50],
    ["Dallas Jones BBQ", Answer.YES.value, 50],
    ["Aleef Cafe", Answer.YES.value, 43.64],
    ["Madison Square Garden", Answer.NO.value, 25.81],
    ["Radio City Music Hall", Answer.YES.value, 28.87],
    ["Times Square", Answer.YES.value, 0],
    ["Rockefeller Center", Answer.YES.value, 0],
    ["Empire State Building", Answer.YES.value, 0],
    ["Bryant Park", Answer.YES.value, 0],
    ["SUMMIT One Vanderbilt", Answer.NO.value, 0],

]

alex_ranked = [
    ['Row House Fitness', Answer.YES.value, 81.64],
    ['LUZwave Arts of Healing, Inc.', Answer.NO.value, 70.71],
    ['Pretty U Skincare Studio', Answer.NO.value, 70.71],
    ['Planet Fitness', Answer.YES.value, 66.66],
    ['LaserAway', Answer.NO.value, 50],
    ['GentleCare Laser Aesthetics', Answer.NO.value, 50],
    ['Flame Broiler', Answer.YES.value, 35.35],
    ['Tasty Dish Cafe', Answer.YES.value, 35.35],
    ['Mauipoki', Answer.YES.value, 33.33],
    ['Oregon', Answer.NO.value, 0],

]

christina_ranked = [
    ['H&M', Answer.YES.value, 81.65],
    ["Macy's", Answer.YES.value, 75.59],
    ['Target', Answer.NO.value, 66.67],
    ['Target', Answer.NO.value, 66.67],
    ['Disney Store', Answer.YES.value, 66.67],
    ['Aleef Cafe', Answer.YES.value, 43.64],
    ['Bond 45', Answer.YES.value, 40],
    ['Crossroads American Kitchen & Bar', Answer.NO.value, 40],
    ['Trump Tower', Answer.NO.value, 0],
    ['Hudson Yards', Answer.YES.value, 0],
]

nic_ranked = [
    ['Hôtel des Invalides', Answer.YES.value, 81.64],
    ["Alma's bridge", Answer.NO.value, 70.71],
    ["Pont d'Iéna", Answer.NO.value, 70.71],
    ['Eiffel Tower', Answer.YES.value, 50],
    ['Trocadéro Square', Answer.YES.value, 50],
    ['Palais de Chaillot', Answer.YES.value, 50],
    ['Statue of Liberty Paris', Answer.NO.value, 50],
    ['Azur Café', Answer.YES.value, 40.82],
    ['Chez Ribe', Answer.YES.value, 26.73],
    ['Tomb of Napoleon Bonaparte', Answer.YES.value, 0],
]


all_lists = [
    evan_ranked,
    evans_mom_ranked,
    alex_ranked,
    christina_ranked,
    nic_ranked
]


def precision_at_k(ranked_list: List[List], k: int) -> float:
    precision = 0

    for c in range(k):
        precision += ranked_list[c][1]

    p_at_k = precision / k
    # print(f'p@{k} = {p_at_k}')
    return p_at_k


def AP_at_N(ranked_list: List[List], N) -> float:
    ap = 0

    for k in range(N):
        ap += precision_at_k(ranked_list, k+1) * ranked_list[k][1]

    return ap / N


def MAP_at_k(all_lists, N):

    sum = 0
    num_lists = len(all_lists)
    for i in range(num_lists):
        ranked_list = all_lists[i]
        ap_at_N = AP_at_N(ranked_list, N)
        print(f'AP@{N} for list {i} = {ap_at_N}')
        sum += ap_at_N

    return sum / num_lists


if __name__ == '__main__':
    # Test - PASSED
    # ranked_list = [["", 1, ""], ["", 0, ""], ["", 0, ""]]
    # ranked_list2 = [["", 0, ""], ["", 1, ""], ["", 0, ""]]
    # ranked_list3 = [["", 0, ""], ["", 0, ""], ["", 1, ""]]
    # p_at_1 = precision_at_k(ranked_list, 1)
    # p_at_2 = precision_at_k(ranked_list, 2)
    # p_at_3 = precision_at_k(ranked_list, 3)

    # # print(p_at_1)
    # # print(p_at_2)
    # # print(p_at_3)

    # print(AP_at_N(ranked_list, 3))
    # print(AP_at_N(ranked_list2, 3))
    # print(AP_at_N(ranked_list3, 3))

    N = 10
    print(f'MAP@{N} = {MAP_at_k(all_lists, N)}')
