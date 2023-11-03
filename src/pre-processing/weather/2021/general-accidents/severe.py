import pandas

# paths of csv files about 2021
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

# import the first csv file
dataset_2021 = pandas.read_csv('dataset/source/accidents-2021/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concat all following csv files
for file in csv_2021:
    dataset_2021 = pandas.concat([dataset_2021, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# select the columns of interest
columns = ['NaturaIncidente', 'Protocollo', 'CondizioneAtmosferica']

dataset_columns = dataset_2021[columns]

dataset_rows = dataset_columns.loc[dataset_columns['CondizioneAtmosferica'].isin(['Grandine in atto', 'Nebbia', 'Nevicata in atto', 'Vento forte'])]


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


# function to assign nature to a group
def group_nature(x):
    for key, values in groups.items():
        if x in values:
            return key


# creation of new columns calling function groupNature
dataset_rows['NaturaIncidente'] = dataset_rows['NaturaIncidente'].apply(group_nature)

# count of natures for each group
natures_count = dataset_rows.groupby('NaturaIncidente')['Protocollo'].count()

# creation of dataframe (two-dimensional data structure) to organize a table with rows and columns
accidents_data_frame = pandas.DataFrame(natures_count)

# renames of columns
accidents_data_frame.rename(columns={"Protocollo": "NumeroIncidenti"}, inplace=True)

# export results in a new csv
accidents_data_frame.to_csv('dataset/processed/weather/2021/general-accidents/generalAccidentsSevere2021.csv', header=True)
