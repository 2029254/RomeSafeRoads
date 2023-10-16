import pandas

# paths of csv files about 2022
csv_2022 = [
    'dataset/source/accidents-2022/02-Febbraio.csv',
    'dataset/source/accidents-2022/03-Marzo.csv',
    'dataset/source/accidents-2022/04-Aprile.csv',
    'dataset/source/accidents-2022/05-Maggio.csv',
    'dataset/source/accidents-2022/06-Giugno.csv',
    'dataset/source/accidents-2022/07-Luglio.csv',
    'dataset/source/accidents-2022/08-Agosto.csv',
]

# import the first csv file
dataset = pandas.read_csv('dataset/source/accidents-2022/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concat all following csv files
for file in csv_2022:
    dataset = pandas.concat([dataset, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# select the columns of interest
columns = ['NaturaIncidente', 'Protocollo']
dataset_columns = dataset[columns]

# select the rows of interest
dataset_rows = dataset_columns

# creation of dictionary to group natures
groups = {
    'Run-off-road collision': ['Fuoriuscita dalla sede stradale'],
    'Injury': ['Infortunio per sola frenata improvvisa', 'Infortunio per caduta del veicolo'],
    'Pedestrian investment': ['Investimento di pedone'],
    'Overturning': ['Ribaltamento senza urto contro ostacolo fisso'],
    'Vehicles collision': ['Scontro frontale fra veicoli in marcia',
                           'Scontro laterale fra veicoli in marcia',
                           'Scontro frontale/laterale SX fra veicoli in marcia',
                           'Scontro frontale/laterale DX fra veicoli in marcia',
                           'Veicolo in marcia contro veicolo in sosta',
                           'Veicolo in marcia contro veicolo fermo',
                           'Veicolo in marcia contro veicolo arresto'],
    'Rear-end collision': ['Tamponamento', 'Tamponamento Multiplo'],
    'Road conditions': ['Veicolo in marcia che urta buche nella carreggiata',
                        'Veicolo in marcia contro ostacolo fisso',
                        'Veicolo in marcia contro ostacolo accidentale'],
    'Other nature': ['Veicolo in marcia contro treno',
                     'Veicolo in marcia contro animale']
}

# function to assign nature to a group
def groupNature(x):
    for key, values in groups.items():
        if x in values:
            return key

# creation of new columns calling function groupNature
dataset_rows['NaturaIncidente'] = dataset_rows['NaturaIncidente'].apply(groupNature)

# count of natures for each group
natures_count = dataset_rows.groupby('NaturaIncidente')['Protocollo'].count()

# creation of dataframe (two-dimensional data structure) to organize a table with rows and columns
accidents_data_frame = pandas.DataFrame(natures_count)

# renames of columns
accidents_data_frame.rename(columns={"Protocollo": "NumeroIncidenti"}, inplace=True)

# export results in a new csv
accidents_data_frame.to_csv('dataset/processed/verticalBarChartData2022.csv', header=True)
