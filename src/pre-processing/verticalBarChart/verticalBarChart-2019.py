import pandas

# paths of csv files about 2019
csv_2019 = [
    'dataset/source/accidents-2019/02-Febbraio.csv',
    'dataset/source/accidents-2019/03-Marzo.csv',
    'dataset/source/accidents-2019/04-Aprile.csv',
    'dataset/source/accidents-2019/05-Maggio.csv',
    'dataset/source/accidents-2019/06-Giugno.csv',
    'dataset/source/accidents-2019/07-Luglio.csv',
    'dataset/source/accidents-2019/08-Agosto.csv',
    'dataset/source/accidents-2019/09-Settembre.csv',
    'dataset/source/accidents-2019/10-Ottobre.csv',
    'dataset/source/accidents-2019/11-Novembre.csv',
    'dataset/source/accidents-2019/12-Dicembre.csv'
]

# import the first csv file
dataset_2019 = pandas.read_csv('dataset/source/accidents-2019/01-Gennaio.csv', sep=';', encoding='latin-1')

# import and concat all following csv files
for file in csv_2019:
    dataset_2019 = pandas.concat([dataset_2019, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# select the columns of interest
columns = ['NaturaIncidente', 'Protocollo', 'DataOraIncidente']
dataset_columns = dataset_2019[columns]

# select the rows of interest
dataset_rows = dataset_columns
# Convert the 'DataOraIncidente' column to a datetime object
dataset_rows['DataOraIncidente'] = pandas.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                      errors='coerce')

dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True)

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
accidents_data_frame.to_csv('dataset/processed/verticalBarChart/verticalBarChartData2019.csv', header=True)
