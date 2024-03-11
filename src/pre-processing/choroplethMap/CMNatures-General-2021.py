import pandas
import geopandas as gpd
from shapely.geometry import Point

# Carica il file .geojson
gdf = gpd.read_file('dataset/source/choropleth-map/municipi.geojson')
csv_2021 = [
    'dataset/source/accidents-2021/02-Febbraio.csv',
    'dataset/source/accidents-2021/03-Marzo.csv',
    'dataset/source/accidents-2021/04-Aprile.csv',
    'dataset/source/accidents-2021/05-Maggio.csv',
    'dataset/source/accidents-2021/06-Giugno.csv',
    'dataset/source/accidents-2021/07-Luglio.csv',
    'dataset/source/accidents-2021/08-Agosto.csv',
    'dataset/source/accidents-2021/09-Settembre.csv',
    'dataset/source/accidents-2021/10-Ottobre.csv',
    'dataset/source/accidents-2021/11-Novembre.csv',
    'dataset/source/accidents-2021/12-Dicembre.csv'
]


# creation of dictionary to group natures
groups = {
    'C1': ['Investimento di pedone'],
    'C2': ['Scontro frontale fra veicoli in marcia',
           'Scontro laterale fra veicoli in marcia'],
    'C3': ['Veicolo in marcia contro veicolo in sosta',
           'Veicolo in marcia contro veicolo fermo',
           'Veicolo in marcia contro veicolo arresto'],
    'C4': ['Tamponamento',
           'Tamponamento Multiplo'],
    'C5': ['Veicolo in marcia che urta buche nella carreggiata',
           'Veicolo in marcia contro ostacolo fisso',
           'Veicolo in marcia contro ostacolo accidentale',
           'Veicolo in marcia contro treno',
           'Veicolo in marcia contro animale'],
    'C6': ['Infortunio per sola frenata improvvisa',
           'Infortunio per caduta del veicolo'],
    'C7': ['Fuoriuscita dalla sede stradale',
           'Ribaltamento senza urto contro ostacolo fisso'],
    'C8':  ['Scontro frontale/laterale DX fra veicoli in marcia',
            'Scontro frontale/laterale SX fra veicoli in marcia']
}

# import the first csv file
dataset_2021 = pandas.read_csv('dataset/source/accidents-2021/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concat all following csv files
for file in csv_2021:
    dataset_2021 = pandas.concat([dataset_2021, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

dataset = dataset_2021[(dataset_2021['Deceduto'] != -1) | (dataset_2021['Deceduto'] != '-1')]

# select the columns of interest
columns = ['Protocollo', 'Longitude', 'Latitude', 'NaturaIncidente', 'DataOraIncidente', 'CondizioneAtmosferica']

dataset_columns = dataset[columns]

# function to assign nature to a group
def group_nature(x):
    for key, values in groups.items():
        if x in values:
            return key


# creation of new columns calling function groupNature
dataset_columns['NaturaIncidente'] = dataset_columns['NaturaIncidente'].apply(group_nature)

# Itera su tutte le righe del DataFrame per ottenere il municipio per ciascuna coordinata
municipi = []
for index, row in dataset_columns.iterrows():
    latitude = row['Latitude']
    longitude = row['Longitude']
    point = Point(longitude, latitude)

    municipio = None
    for idx, gdf_row in gdf.iterrows():
        if gdf_row['geometry'].contains(point):
            municipio = gdf_row['nome']
            break

    municipi.append(municipio)

# Aggiungi la colonna 'Municipio' al DataFrame originale
dataset_columns['Municipio'] = municipi

# Convert the 'DataOraIncidente' column to a datetime object
dataset_columns['DataOraIncidente'] = pandas.to_datetime(dataset_columns['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                      errors='coerce')

dataset_columns.dropna(subset=['DataOraIncidente'], inplace=True)

# Define a function to round the date to the nearest 10 days
def round_date_to_10_days(date):
    day = 10
    month = date.month
    year = date.year
    if month == 1 and day == 1:
        day = 1
    elif date.month == 12 and date.day >= 20:
        day = 1
        month = 1
        year = year + 1
    elif date.day < 10:
        day = 10
    elif date.day < 20:
        day = 20
    elif date.day > 20 and date.month < 12:
        day = 1
        month = month + 1
    return pandas.to_datetime(f"{day}/{month}/{year}", format='%d/%m/%Y')


# Apply the function to round the date
dataset_columns['DataOraIncidente'] = dataset_columns['DataOraIncidente'].apply(round_date_to_10_days)

# creation of dataframe (two-dimensional data structure) to organize a table with rows and columns
accidents_data_frame = pandas.DataFrame(dataset_columns)

# export results in a new csv for the current year
accidents_data_frame.to_csv('dataset/processed/choroplethMap/choroplethMapNatureGeneral2021.csv', header=True)
