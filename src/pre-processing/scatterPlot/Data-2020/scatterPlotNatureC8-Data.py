import pandas

# paths of csv files about 2020
csv_2020 = [
    'dataset/source/accidents-2020/02-Febbraio.csv',
    'dataset/source/accidents-2020/03-Marzo.csv',
    'dataset/source/accidents-2020/04-Aprile.csv',

    'dataset/source/accidents-2020/07-Luglio.csv',
    'dataset/source/accidents-2020/08-Agosto.csv',
    'dataset/source/accidents-2020/09-Settembre.csv',
    'dataset/source/accidents-2020/10-Ottobre.csv',
    'dataset/source/accidents-2020/11-Novembre.csv',

]

csv_2020PartOne = [
    'dataset/source/accidents-2020/05-Maggio.csv',
    'dataset/source/accidents-2020/06-Giugno.csv',
    'dataset/source/accidents-2020/12-Dicembre.csv',

]

# Import the first CSV file for the complete dataset
dataset_2020 = pandas.read_csv('dataset/source/accidents-2020/01-Gennaio.csv', sep=';', encoding='latin-1')

# Import and concatenate CSV files for the first part
dataset_2020PartOne = pandas.concat([pandas.read_csv(file, sep=';', encoding='latin-1') for file in csv_2020PartOne], ignore_index=True)


# Concatenate the filtered CSV files for the complete dataset
for file in csv_2020:
    dataset_2020 = pandas.concat([dataset_2020[(dataset_2020['Deceduto'] == -1) | (dataset_2020['Deceduto'] == '-1')],
                                  pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

# Concatenate the first part to the complete dataset
dataset_2020 = pandas.concat([dataset_2020, dataset_2020PartOne], ignore_index=True)

# select the columns of interest
columns = ['TipoVeicolo', 'FondoStradale', 'Traffico', 'NUM_FERITI', 'NUM_MORTI', 'NUM_ILLESI', 'NUM_RISERVATA', 'Deceduto', 'CinturaCascoUtilizzato','Latitude', 'Longitude', 'NaturaIncidente']

dataset_columns = dataset_2020[columns]

# select the rows of interest
dataset_rows = dataset_columns

dataset_columns['FondoStradale'] = dataset_columns['FondoStradale'].fillna('Asciutto')

# Mappatura dei valori di FondoStradale
mappa_qualita_fondo = {
    'Asciutto': 1,
    'Una carreggiata a doppio senso': 1,
    'Bagnato (pioggia)': 2,
    'Bagnato (umidità in atto)': 3,
    'Bagnato (brina)': 3,
    'Viscido da liquidi oleosi': 4,
    'Sdrucciolevole (fango)': 4,
    'Sdrucciolevole (pietrisco)': 4,
    'Sdrucciolevole (terriccio)': 4,
    'Con neve': 5,
    'Ghiacciato': 5,
    '': 0
}

# Aggiungi la colonna QualitàFondoStradale al DataFrame
dataset_columns['QualitaFondoStradale'] = dataset_columns['FondoStradale'].map(mappa_qualita_fondo).fillna(5)

# Rimuovi la colonna FondoStradale
dataset_columns = dataset_columns.drop(['FondoStradale'], axis=1)

dataset_columns['Traffico'] = dataset_columns['Traffico'].fillna('')

# Mappatura dei valori di Traffico
mappa_intensita_traffico = {
    'Scarso': 1,
    'Normale': 2,
    'Intenso': 3,
    '': 1
}

# Aggiungi la colonna IntensitaTraffico al DataFrame
dataset_columns['IntensitaTraffico'] = dataset_columns['Traffico'].map(mappa_intensita_traffico).fillna(1)

# Rimuovi la colonna Traffico
dataset_columns = dataset_columns.drop(['Traffico'], axis=1)

dataset_columns['CinturaCascoUtilizzato'] = dataset_columns['CinturaCascoUtilizzato'].fillna('')

# Mappatura dei valori di CinturaCascoUtilizzato
mappa_utilizzo_protezioni = {
    'Non accertato': 0,
    'Utilizzato': 1,
    'Esente': 0,
    'Non utilizzato': 0,
    '': 1
}

# Aggiungi la colonna UtilizzoProtezioni al DataFrame
dataset_columns['UtilizzoProtezioni'] = dataset_columns['CinturaCascoUtilizzato'].map(mappa_utilizzo_protezioni).fillna(1)

# Rimuovi la colonna CinturaCascoUtilizzato
dataset_columns = dataset_columns.drop(['CinturaCascoUtilizzato'], axis=1)
dataset_columns['NUM_FERITI'] = dataset_columns['NUM_FERITI'].fillna(0.0)
dataset_columns['NUM_MORTI'] = dataset_columns['NUM_MORTI'].fillna(0.0)
dataset_columns['NUM_ILLESI'] = dataset_columns['NUM_ILLESI'].fillna(0.0)
dataset_columns['NUM_RISERVATA'] = dataset_columns['NUM_RISERVATA'].fillna(0.0)


dataset_columns['Deceduto'] = dataset_columns['Deceduto'].fillna('')

# Mappatura dei valori di Deceduto
mappa_deceduti = {
    'illeso': 0,
    '': 0,
    -1: 1,
    '-1': 1
}

# Aggiungi la colonna UtilizzoProtezioni al DataFrame
dataset_columns['Deceduto'] = dataset_columns['Deceduto'].map(mappa_deceduti).fillna(0.0)

groups = {
    'Autovettura': ['Autovettura privata',
                    'Autovettura di polizia',
                    'Autoveicolo transp.promisc.'],
    'Motociclo': ['Motociclo a solo',
                  'Motociclo con passeggero'],
    'Autocarro': ['Autocarro inferiore 35 q.',
                  'Autopompa'],
    'Ignoto': ['Veicolo ignoto perch FUGA',
               'Veicolo a braccia']
}


# function to assign nature to a group
def group_vehicle(x):
    for key, values in groups.items():
        if x in values:
            return key


# creation of new columns calling function groupNature
dataset_columns['TipoVeicolo'] = dataset_columns['TipoVeicolo'].apply(group_vehicle)

dataset_columns['TipoVeicolo'] = dataset_columns['TipoVeicolo'].fillna('Autovettura')

dataset_columns = dataset_columns.loc[dataset_columns['NaturaIncidente'].isin(['Scontro frontale/laterale DX fra veicoli in marcia', 'Scontro frontale/laterale SX fra veicoli in marcia'])]

# Successivamente, puoi procedere con le operazioni necessarie sul DataFrame 'dataset_columns'

accidents_data_frame = pandas.DataFrame(dataset_columns)

# Riordina il DataFrame in base alla colonna 'Deceduto'
accidents_data_frame = accidents_data_frame.sort_values(by='Deceduto')

accidents_data_frame.drop(columns=['NaturaIncidente'], inplace=True)

# export results in a new csv
accidents_data_frame.to_csv('dataset/processed/scatterPlot/Data/scatterPlotNatureC8-2020.csv', header=True)