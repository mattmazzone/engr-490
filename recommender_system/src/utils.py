from ast import Raise
from calendar import week
from contextlib import closing
import copy
from datetime import date, datetime, timedelta, time, timezone
from weakref import ref
from tkinter import NO
from sklearn.metrics.pairwise import cosine_similarity
import pandas as pd
import random
from sklearn.metrics.pairwise import cosine_similarity
import numpy as np
import re

# https://developers.google.com/maps/documentation/places/web-service/place-types
#FOR duration: integer represents hour
#FOR maxAmountPerDay, integer represents number of times to go per day
#FOR MorningOrAftertoonOrEvening
#Morning only: 1 (8am-12pm)
#Afternoon only: 2 (12pm-6pm)
#Evening only: 3 (6pm-11pm)
#Morning or afternoon: 4
#Morning or Evening: 5
#Afternoon or Evening: 6
#All three/any: 0
place_types = {
    "cultural_center" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    #"chinese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"japanese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"indonesian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"korean_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"ramen_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"sushi_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"vietnamese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"thai_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"lebanese_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"middle_eastern_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"turkish_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"american_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"barbecue_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"hamburger_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"pizza_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"cafe" : {"duration": 0.5,"maxAmountPerDay": 3,"MorningOrAftertoonOrEvening": 4},
    #"bakery" : {"duration": 0.25,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    #"sandwich_shop" : {"duration": 0.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    #"breakfast_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    #"brunch_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1},
    #"italian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"mediterranean_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"greek_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"vegan_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"vegetarian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"brazilian_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    #"mexican_restaurant" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},
    "amusement_park" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "aquarium" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "bowling_alley" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "casino" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "movie_theater" : {"duration": 2.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "national_park" : {"duration": 3,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "hiking_area" : {"duration": 3,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "night_club" : {"duration": 3,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 3},
    "tourist_attraction" : {"duration": 2,"maxAmountPerDay": 10,"MorningOrAftertoonOrEvening": 0},
    "zoo" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "historical_landmark" : {"duration": 1,"maxAmountPerDay": 5,"MorningOrAftertoonOrEvening": 4},
    "spa" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "church" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "hindu_temple" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "mosque" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "synagogue" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "book_store" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "clothing_store" : {"duration": 0.5,"maxAmountPerDay": 10,"MorningOrAftertoonOrEvening": 0},
    "gift_shop" : {"duration": 0.5,"maxAmountPerDay": 2,"MorningOrAftertoonOrEvening": 0},
    "jewelry_store" : {"duration": 0.5,"maxAmountPerDay": 2,"MorningOrAftertoonOrEvening": 0},
    "liquor_store" : {"duration": 0.25,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "shopping_mall" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "golf_course" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4},
    "gym" : {"duration": 1.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "playground" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "ski_resort" : {"duration": 4,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "sports_club" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},
    "swimming_pool" : {"duration": 2,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0},

    "102-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Mexican 
    "102-005" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Mexican-Yucateca
    "102-006" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Mexican-Oaxaquena
    "102-007" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Mexican-Veracruzana
    "102-008" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Mexican-Poblana
    "404-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Argentinean
    "406-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Brazilian
    "406-035" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Brazilian-Baiana
    "406-038" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Brazilian-Bakery
    "406-036" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Brazilian-Capixaba
    "406-037" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Brazilian-Mineira
    "405-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Chilean
    "403-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Latin American
    "407-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Peruvian
    "400-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #South American
    "401-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Surinamese
    "402-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Venezuelan 

    "200-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Asian
    "201-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese
    "201-009" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Szechuan
    "201-010" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Cantonese
    "201-041" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Shanghai
    "201-042" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Beijing
    "201-043" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Hunan/Hubei
    "201-044" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Jiangsu/Zhejiang
    "201-045" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Shandong
    "201-046" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Northeastern
    "201-047" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Inner Mongolian
    "201-048" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Yunnan/Guizhou
    "201-049" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Taiwanese
    "201-050" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Guangxi
    "201-051" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Jiangxi
    "201-052" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Northwestern
    "201-053" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Porridge
    "201-054" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Islamic
    "201-055" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Chinese-Hot Pot
    "203-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Japanese
    "203-026" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Japanese-Sushi
    "204-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Southeast Asian
    "205-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Thai
    "206-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Vietnamese
    "207-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Korean
    "208-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Pakistani
    "209-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Malaysian
    "210-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Bruneian
    "211-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Indonesian
    "212-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Filipino
    "800-085" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},#Noodles
    "202-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian
    "202-011" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Tandoori
    "202-012" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Punjabi
    "202-013" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Rajasthani
    "202-014" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Mughlai
    "202-015" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Bengali
    "202-016" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Goan
    "202-017" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Jain
    "202-018" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Konkani
    "202-019" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Gujarati
    "202-020" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Parsi
    "202-021" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-South Indian
    "202-022" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Maharashtrian
    "202-023" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-North Indian
    "202-024" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Malvani
    "202-025" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Indian-Hyderabad 

    "250-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Middle Eastern
    "251-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Azerbaijani
    "252-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Turkish
    "253-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Lebanese
    "254-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Yemeni
    "255-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Burmese
    "256-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Cambodian
    "257-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Singaporean
    "258-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Sri Lankan
    "259-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Tibetan 
    "101-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American
    "101-001" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American-Californian
    "101-002" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American-Southwestern
    "101-003" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American-Barbecue/Southern
    "101-004" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American-Creole
    "101-039" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American-Native American
    "101-040" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American-Soul Food
    "101-070" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #American-Cajun
    "103-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Canadian
    "150-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Australian
    "151-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Hawaiian/Polynesian
    "152-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Caribbean
    "153-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Cuban
    "800-067" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Burgers
    "800-056" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Steak House
    "800-059" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Hot Dogs
    "800-062" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Chicken 

    "300-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #European
    "301-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French
    "301-027" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French-Alsatian
    "301-028" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French-Auvergnate
    "301-029" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French-Basque
    "301-030" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French-Corse
    "301-031" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French-Lyonnaise
    "301-032" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French-Provencale
    "301-033" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #French-Sud-ouest
    "302-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #German
    "303-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Greek"
    "304-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Italian"
    "305-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Irish
    "306-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Austrian
    "307-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Belgian
    "308-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #British Isles
    "309-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Dutch
    "310-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Swiss
    "313-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Portuguese 

    "373-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Baltic
    "374-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Belorusian
    "375-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Ukrainian
    "376-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Polish
    "377-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Russian
    "378-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Bohemian
    "379-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Balkan
    "380-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Caucasian
    "381-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Romanian
    "382-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Armenian
    "370-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #East European
    "371-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Hungarian 

    "350-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Scandinavian
    "351-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Finnish
    "352-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Swedish
    "353-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Norwegian
    "354-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Danish
    "309-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Dutch
    "310-000" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Swiss 

    "500-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #African
    "501-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Moroccan
    "502-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Egyptian
    "503-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Ethiopian
    "504-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Seychellois
    "505-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #South African
    "506-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #North African 

    "800-060" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Sandwhich
    "800-061" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1}, #Breakfast
    "800-072" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 1}, #Brunch
    "800-073" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Bistro
    "800-080" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Soup
    "100-1100-0000" : {"duration": 0.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4}, #Coffee-Tea
    "100-1100-0010" : {"duration": 0.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4}, #Coffee Shop
    "100-1100-0331" : {"duration": 0.5,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 4}, #Tea House
    "800-068" :  {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 0} #Creperie

    "304-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Italian
    "800-057" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Pizza
    "315-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Sicilian

    "372-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Mediterranean
    "303-000" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},  #Greek
    "311-000" : "311-034", {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6},  #Spanish, including Tapas
    "800-075" : {"duration": 1,"maxAmountPerDay": 1,"MorningOrAftertoonOrEvening": 6}, #Seafood

    "800-076" : {"duration": 1,"maxAmountPerDay": 3,"MorningOrAftertoonOrEvening": 0}, #Vegan
    "800-077" : {"duration": 1,"maxAmountPerDay": 3,"MorningOrAftertoonOrEvening": 0}, #Vegetarian
    "800-083" : {"duration": 1,"maxAmountPerDay": 3,"MorningOrAftertoonOrEvening": 0}, #Natural/Healthy
    "800-084" : {"duration": 1,"maxAmountPerDay": 3,"MorningOrAftertoonOrEvening": 0}, #Organic

}


# Transforms the json returned from the google places api into a
# properly formatted dataframe (1s and 0s, not normalized yet).
# Add a print at the end to see what the df looks like
def create_df(google_places_json) -> pd.DataFrame:
    data = []
    row_indices = []
    for place in google_places_json:
        types = place['types']
        place_types_copy = copy.deepcopy(place_types)
        for type in types:
            # should always be true
            if type in place_types_copy:
                place_types_copy[type] = 1
        data.append(place_types_copy)
        row_indices.append(place['id'])

    places_df = pd.DataFrame(data, index=row_indices)
    return places_df


def create_rating_df(recent_places) -> pd.DataFrame:
    recent_places_ratings = []
    for place in recent_places:
        rating = {}
        rating['id'] = place['id']
        rating['rating'] = place['rating']
        recent_places_ratings.append(rating)
    data = []
    row_indices = []
    for place in recent_places_ratings:
        data.append({'rating': place['rating']})
        row_indices.append(place['id'])

    return pd.DataFrame(data, index=row_indices)


def multiply_rating(row: pd.Series, recent_place_ratings) -> pd.Series:
    rating: float = recent_place_ratings['rating'][row.name]
    normalized_rating = rating / 5
    row_weighted = row * normalized_rating
    row.update(row_weighted)
    return row


def is_same_day(date1: datetime, date2: datetime) -> bool:
    return date1.year == date2.year and date1.month == date2.month and date1.day == date2.day


def find_relavent_meeting(trip_meetings, end_time):
    for i in range(len(trip_meetings)):
        meeting = trip_meetings[i]
        if meeting['start'] >= end_time:
            return i

    return -1

def addHighestRestaurant(places, nearby_places_picked, start_time, end_time):
    if start_time.weekday() == 6:
        weekday = 0
    else:
        weekday = start_time.weekday()+1
    
    for place in places:
        newIndex = weekday
        change = False
        best_place_id = place['placeId']
        #make sure there is information when accessing the regular opening hours of the place
        openingHours = place.get('openingHours')
        if openingHours is None:
            continue
        if best_place_id not in nearby_places_picked:
            for i in range(len(place['openingHours'])):
                if weekday == openingHours[i]['open']['day']:
                    newIndex = i
                    change = True
                    break
            if change == False & newIndex == weekday:
                continue
            #get the opening time
            openingDay = place['openingHours'][newIndex]['open']['day']
            openingHour = place['openingHours'][newIndex]['open']['hour']
            openingMinute = place['openingHours'][newIndex]['open']['minute']
            openingTime = time(openingHour, openingMinute)
            #get the closing time
            closingDay = place['openingHours'][newIndex]['close']['day']
            closingHour = place['openingHours'][newIndex]['close']['hour']
            closingMinute = place['openingHours'][newIndex]['close']['minute']
            if closingHour == 24:
                closingHour = 0
                closingDay = closingDay + 1
            closingTime = time(closingHour, closingMinute)

            print("Opening time: ", openingTime)
            print("Start time: ", start_time.time())
            print("End time: ", end_time.time())
            print ("Closing time: ", closingTime) 

            if openingTime <= start_time.time() and (openingDay != closingDay or closingTime >= end_time.time()):
                print("Place scheduled: ", place['title'])
                nearby_places_picked.add(best_place_id)
                return {'place_id': best_place_id, 'place_name': place['title'], 'address': place['address'], 'score': place['similarity'], 'types': place['types']}

# Function to parse datetime with multiple formats        
def parse_datetime(date_str, format_str):
    
    for fmt in format_str:
        try:
            return datetime.strptime(date_str, fmt)
        except ValueError:
            continue
    raise ValueError(f"Time data '{date_str}' does not match any format in {format_str}")



def addHighestPlace(places, nearby_places_picked, start_time, end_time):
    if start_time.weekday() == 6:
        weekday = 0
    else:
        weekday = start_time.weekday()+1

    for place in places:
        best_place_id = place['info']['id']
        #make sure there is information when accessing the regular opening hours of the place
        openingHours = place['info'].get('regularOpeningHours')
        information = place.get('info')
        if openingHours is None or information is None:
            continue
        if best_place_id not in nearby_places_picked:
            #make sure to select the right index for the day of the week
            print("Activity look: ", place['info']['displayName']['text'])
            if len(place['info']['regularOpeningHours']['periods']) < 7:
                print("Start of looking for the right day")
                comparison = weekday
                change = False
                for i in range(len(place['info']['regularOpeningHours']['periods'])-1):
                    if weekday == place['info']['regularOpeningHours']['periods'][i]['open']['day']:
                        weekday = i
                        change = True
                        break
                if weekday == comparison and change == False:
                    continue    
            
            #get the opening time
            openingDay = place['info']['regularOpeningHours']['periods'][weekday]['open']['day']
            openingHour = place['info']['regularOpeningHours']['periods'][weekday]['open']['hour']
            openingMinute = place['info']['regularOpeningHours']['periods'][weekday]['open']['minute']
            openingTime = time(openingHour, openingMinute)
            
            #get the closing time
            closingDay = place['info']['regularOpeningHours']['periods'][weekday]['close']['day']
            closingHour = place['info']['regularOpeningHours']['periods'][weekday]['close']['hour']
            closingMinute = place['info']['regularOpeningHours']['periods'][weekday]['close']['minute']
            closingTime = time(closingHour, closingMinute)

            print("Opening time: ", openingTime)
            print("Start time: ", start_time.time())
            print("End time: ", end_time.time())
            print ("Closing time: ", closingTime) 

            if openingTime <= start_time.time() and (openingDay != closingDay or closingTime >= end_time.time()):
                print("Place scheduled: ", place['info']['displayName']['text'])
                nearby_places_picked.add(best_place_id)
                return {'place_id': best_place_id, 'place_name': place['info']['displayName']['text'], 'address': place['info']['formattedAddress'], 'score': place['similarity']}

def create_scheduled_activities(similarity_tables, nearby_places, free_slots, trip_meetings, time_zones, nearbyRestaurants):
    format_trips = ['%Y-%m-%dT%H:%M:%S%z', '%Y-%m-%dT%H:%M:%S.%f%z', '%Y-%m-%dT%H:%M:%S.%f%Z']
    format_slots = ['%Y-%m-%dT%H:%M:%S.%f%z',
                    '%Y-%m-%dT%H:%M:%S.%f%Z',]
    activity_duration = timedelta(hours=1.5)
    broken_up_free_slots = []

    for index,meeting in enumerate(trip_meetings):
        print(f"Meeting {index} start: {meeting['start']}")
        meeting['start'] = parse_datetime(meeting['start'], format_trips)
        meeting['end'] = parse_datetime(meeting['end'], format_trips)
        timezone_offset = timedelta(seconds=time_zones[index]['rawOffset'] + time_zones[index]['dstOffset'])
        meeting['start'] = meeting['start'] + timezone_offset
        meeting['end'] = meeting['end'] + timezone_offset

    trip_meetings.sort(key=lambda x: x['start'])

    for i in range(len(similarity_tables)):
        trip_meetings[i]['nearby_place_similarities'] = similarity_tables[i]

    for slot in free_slots:
        formatted = False
        for format in format_slots:
            try:
                slot_start = datetime.strptime(slot['start'], format)
                slot_start = slot_start.replace(tzinfo=timezone.utc)
                slot_end = datetime.strptime(slot['end'],  format)
                slot_end = slot_end.replace(tzinfo=timezone.utc)
                timezone_offset = timedelta(seconds=time_zones[0]['rawOffset'] + time_zones[0]['dstOffset'])
                new_timezone = timezone(timedelta(hours = ((timezone_offset.seconds/3600) - 24)))
                slot_start = slot_start + timezone_offset
                slot_start = slot_start.replace(tzinfo=new_timezone)
                slot_end = slot_end + timezone_offset
                slot_end = slot_end.replace(tzinfo=new_timezone)

                current_end = slot_start + activity_duration
                while current_end <= slot_end:
                    current_start = current_end - activity_duration
                    broken_up_free_slots.append(
                        {"start": current_start, "end": current_end})
                    current_end = current_end + activity_duration
                formatted = True
                break
            except Exception as e:
                print(e)

        if not formatted:
            raise ValueError('No valid date format found')

    if len(trip_meetings) == 0:
        # Since there are no trip meetings, there can only be 1 similarity table and 1 nearby places array
        if len(nearby_places) != 1 or len(similarity_tables) != 1:
            raise ValueError(
                "nearby_places or similarity_table incorrect length")

        for slot in broken_up_free_slots:
            slot['place_similarity'] = similarity_tables[0]
            slot['places_dict'] = nearby_places[0]
    else:
        trip_meetings.sort(key=lambda x: x['start'])

        for i in range(len(similarity_tables)):
            trip_meetings[i]['nearby_place_similarities'] = similarity_tables[i]

        for slot in broken_up_free_slots:
            index = find_relavent_meeting(trip_meetings, slot['end'])
            relevant_meeting = trip_meetings[index]
            slot['place_similarity'] = relevant_meeting['nearby_place_similarities']
            slot['places_dict'] = nearby_places[index]

    nearby_places_picked = set()
    breakfast_time_range = {"start": time(8, 0, 0), "end": time(10, 0, 0)}
    lunch_time_range = {"start":   time(12, 0, 0), "end": time(14, 0, 0)}
    dinner_time_range = {"start": time(18, 0, 0), "end": time(20, 0, 0)}

    #start the day index to the first day of the trip for the restaurant
    dayIndex = 0

    #schedule places in free time slots
    for i in range(len(broken_up_free_slots)):
        slot = broken_up_free_slots[i]
        slot_start = slot['start']
        slot_end = slot['end']
        similarity_table: pd.DataFrame = slot['place_similarity']
        places_dict = slot['places_dict']

        breakfast_places = nearbyRestaurants[str(dayIndex)]["breakfast"]
        lunch_places = nearbyRestaurants[str(dayIndex)]["lunch"]
        dinner_places = nearbyRestaurants[str(dayIndex)]["dinner"]
        other_places = []

        for place in places_dict:
            sim = similarity_table.loc[place['id'], 'similarity']
            obj = {"info": place, "similarity": sim}
            if 'breakfast_restaurant' not in place['types'] and 'coffee_shop' not in place['types'] and 'cafe' not in place['types'] and 'brunch_restaurant' not in place['types'] and 'restaurant' not in place['types']:
                other_places.append(obj)

        breakfast_places = sorted(
            breakfast_places, key=lambda x: x['similarity'])
        lunch_places = sorted(
            lunch_places, key=lambda x: x['similarity'])
        dinner_places = sorted(
            dinner_places, key=lambda x: x['similarity'])
        other_places = sorted(
            other_places, key=lambda x: x['similarity'])

        # print(f'length of breakfast_places {len(breakfast_places)}')
        # print(f'length of restaurant_places {len(restaurant_places)}')
        # print(f'length of other_places {len(other_places)}')
        # print()

        highestPlace = None
        if len(breakfast_places) > 0 and breakfast_time_range['start'] <= slot_start.time() and slot_end.time() <= breakfast_time_range['end']:
            slot['place_similarity'] = addHighestRestaurant(
                breakfast_places, nearby_places_picked, slot_start, slot_end)
        elif len(lunch_places) > 0 and lunch_time_range['start'] <= slot_start.time() and slot_end.time() <= lunch_time_range['end']:
            slot['place_similarity'] = addHighestRestaurant(
                lunch_places, nearby_places_picked, slot_start, slot_end)
        elif len(dinner_places) > 0 and dinner_time_range['start'] <= slot_start.time() and slot_end.time() <= dinner_time_range['end']:
            slot['place_similarity'] = addHighestRestaurant(
                dinner_places, nearby_places_picked, slot_start, slot_end)
        else:
            slot['place_similarity'] = addHighestPlace(
                other_places, nearby_places_picked, slot_start, slot_end)
        del slot['places_dict']

        #change index to the next day if the next free time slot is on the next day of trip
        if i < len(broken_up_free_slots)-1 and broken_up_free_slots[i]['end'].weekday() != broken_up_free_slots[i+1]['start'].weekday():
            print("Day index changed")
            print("Day end free time slot:", broken_up_free_slots[i]['end'].weekday())
            print("Day start next free time slot:", broken_up_free_slots[i+1]['start'].weekday())
            dayIndex += 1
    
    filtered_data = [entry for entry in broken_up_free_slots if entry['place_similarity'] is not None]

    #raise NotImplemented('WIP')
    return filtered_data


def create_interests_df(interests):
    data = []
    place_types_copy = copy.deepcopy(place_types)
    for type in interests:
        # Should always be true
        if type in place_types_copy:
            place_types_copy[type] = random.uniform(0.75, 1)
    data.append(place_types_copy)
    interests_df = pd.DataFrame(data)
    return interests_df


def create_type_vector(item_types, all_types):
    """Create a binary vector for the item types based on all_types."""
    return [1 if typ in item_types else 0 for typ in all_types]

def calculate_cosine_similarity(vector1, vector2):
    """Calculate cosine similarity between two vectors."""
    v1, v2 = np.array(vector1).reshape(1, -1), np.array(vector2).reshape(1, -1)
    return cosine_similarity(v1, v2)[0][0]

def calculate_similarity_score(current_item, past_items, all_types):
    """
    Calculate the maximum cosine similarity score between the current item and past items based on their types.

    Parameters:
    - current_item: dict with 'types' key representing categories of the current item.
    - past_items: list of dicts, each with a 'types' key representing categories of past items.
    - all_types: list or set of all predefined unique types for vectorization.

    Returns:
    - max_similarity: The highest cosine similarity score between the current item and any of the past items.
    """
    
    # Create binary vectors for the current and past items types
    current_vector = np.array(create_type_vector(current_item['types'], all_types)).reshape(1, -1)
    
    # Initialize max similarity
    max_similarity = 0
    
    # Iterate through past items to calculate similarities
    for past_item in past_items:
        print(past_item)
        past_types = past_item['place_similarity']['types']
        past_vector = np.array(create_type_vector(past_types, all_types)).reshape(1, -1)
        similarity = cosine_similarity(current_vector, past_vector)[0][0]
        max_similarity = max(max_similarity, similarity)
    
    return max_similarity


def parse_time(time_str):
    """Parse a time string into hour and minute."""
    hour, minute = map(int, time_str.split(':'))
    return hour, minute

def day_range_to_numbers(day_range):
    """Converts day ranges into a list of day numbers (0=Sunday, 6=Saturday)."""
    day_map = {'Mon': 1, 'Tue': 2, 'Wed': 3, 'Thu': 4, 'Fri': 5, 'Sat': 6, 'Sun': 0}
    if '-' in day_range:
        start_day, end_day = day_range.split('-')
        start_num, end_num = day_map[start_day.strip()], day_map[end_day.strip()]
        return list(range(start_num, end_num + 1)) if start_num <= end_num else list(range(start_num, 7)) + list(range(0, end_num + 1))
    else:
        return [day_map[day_range.strip()]]

def convert_opening_hours(opening_hours_list):
    all_days = set(range(7))  # Representing days as 0-6 for Sun-Sat
    results = []
    open_days = set()

    for hours_list in opening_hours_list:
        for hours in hours_list:
            # Splitting the days part and the hours part
            days_part, hours_part = hours.split(': ', 1)
            time_ranges = [time_range.strip() for time_range in hours_part.split(',')]

            # Parse the days, which might be ranges or individual days
            if ',' in days_part:
                days = [day.strip() for day in days_part.split(',')]
            else:
                days = [days_part]

            for day in days:
                day_nums = day_range_to_numbers(day)
                open_days.update(day_nums)
                for day_num in day_nums:
                    for time_range in time_ranges:
                        start_time_str, end_time_str = time_range.split(' - ')
                        start_hour, start_minute = parse_time(start_time_str)
                        end_hour, end_minute = parse_time(end_time_str)

                        # Adjusting for the case when the end time is 24:00, which is equivalent to 00:00 of the next day
                        if end_hour == 24:
                            end_hour = 0
                            end_minute = 0
                            day_num = (day_num + 1) % 7

                        results.append({
                            "open": {"day": day_num, "hour": start_hour, "minute": start_minute},
                            "close": {"day": day_num, "hour": end_hour, "minute": end_minute},
                        })

    # Determine closed days
    closed_days = all_days - open_days
    for closed_day in closed_days:
        results.append({
            "open": {"day": closed_day, "hour": 0, "minute": 0},
            "close": {"day": closed_day, "hour": 0, "minute": 0},
        })

    # Sort results by day and opening time for consistency
    results.sort(key=lambda x: (x['open']['day'], x['open']['hour'], x['open']['minute']))

    return results
