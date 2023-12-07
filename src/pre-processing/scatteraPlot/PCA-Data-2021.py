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
columns = ['TipoVeicolo', 'FondoStradale', 'Traffico', 'NUM_FERITI', 'NUM_MORTI', 'NUM_ILLESI', 'NUM_RISERVATA', 'Deceduto', 'DecedutoDopo', 'CinturaCascoUtilizzato']

dataset_columns = dataset_2021[columns]

# select the rows of interest
dataset_rows = dataset_columns

dataset_columns['FondoStradale'] = dataset_columns['FondoStradale'].fillna('')

# Mappatura dei valori di FondoStradale
mappa_qualita_fondo = {
    'Asciutto': 4,
    'Bagnato (pioggia)': 3,
    'Bagnato (umidità in atto)': 2,
    'Viscido da liquidi oleosi': 1,
    '': 4
}

# Aggiungi la colonna QualitàFondoStradale al DataFrame
dataset_columns['QualitaFondoStradale'] = dataset_columns['FondoStradale'].map(mappa_qualita_fondo)

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
dataset_columns['IntensitaTraffico'] = dataset_columns['Traffico'].map(mappa_intensita_traffico)

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
dataset_columns['UtilizzoProtezioni'] = dataset_columns['CinturaCascoUtilizzato'].map(mappa_utilizzo_protezioni)

# Rimuovi la colonna CinturaCascoUtilizzato
dataset_columns = dataset_columns.drop(['CinturaCascoUtilizzato'], axis=1)

dataset_columns['DecedutoDopo'] = dataset_columns['DecedutoDopo'].fillna('')

# Mappatura dei valori di DecedutoDopo
mappa_deceduti_dopo = {
    'DECEDEUTO': 1,
    'NON DECEDUTO': 0,
    'DECEDEUTO ENTRO 2 MESI': 1,
    'DECEDEUTO ENTRO 15 GIORNI': 1,
    'DECEDEUTO ENTRO LE DODICI ORE': 1,
    '': 0
}

# Aggiungi la colonna UtilizzoProtezioni al DataFrame
dataset_columns['DecedutoDopo'] = dataset_columns['DecedutoDopo'].map(mappa_deceduti_dopo)

dataset_columns['NUM_FERITI'] = dataset_columns['NUM_FERITI'].fillna(0)
dataset_columns['NUM_MORTI'] = dataset_columns['NUM_MORTI'].fillna(0)
dataset_columns['NUM_ILLESI'] = dataset_columns['NUM_ILLESI'].fillna(0)
dataset_columns['NUM_RISERVATA'] = dataset_columns['NUM_RISERVATA'].fillna(0)
dataset_columns['Deceduto'] = dataset_columns['Deceduto'].fillna(0)

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

accidents_data_frame = pandas.DataFrame(dataset_columns)

# export results in a new csv
accidents_data_frame.to_csv('dataset/processed/scatterPlot/PCA-Data-2021.csv', header=True)