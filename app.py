import pandas
from sklearn.decomposition import PCA
from sklearn.preprocessing import StandardScaler
from flask import request
from flask import Flask
from flask_cors import CORS
import os

# Look to the path of your current working directory
working_directory = os.getcwd()
index_src = working_directory.rfind('\\src')

# Ottieni la sottostringa fino all'indice di '\src'
if index_src != -1:
    new_path = working_directory[:index_src]
else:
    new_path = working_directory



app = Flask(__name__)
CORS(app)  # Abilita CORS per tutta l'applicazione


# Definisci la funzione per calcolare la PCA
def calculate_pca(nature, year):
    csv_2022 = [
        os.path.join(new_path, 'dataset/source/accidents-2022/02-Febbraio.csv'),
        os.path.join(new_path, 'dataset/source/accidents-2022/03-Marzo.csv'),
        os.path.join(new_path, 'dataset/source/accidents-2022/04-Aprile.csv'),
        os.path.join(new_path, 'dataset/source/accidents-2022/05-Maggio.csv'),
        os.path.join(new_path, 'dataset/source/accidents-2022/06-Giugno.csv'),
        os.path.join(new_path, 'dataset/source/accidents-2022/07-Luglio.csv'),
        os.path.join(new_path, 'dataset/source/accidents-2022/08-Agosto.csv'),
    ]

    csv = [
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/02-Febbraio.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/03-Marzo.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/04-Aprile.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/05-Maggio.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/06-Giugno.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/07-Luglio.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/08-Agosto.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/09-Settembre.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/10-Ottobre.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/11-Novembre.csv'),
        os.path.join(new_path, 'dataset/source/accidents-' + year + '/12-Dicembre.csv')
    ]

    # import the first csv file
    dataset = pandas.read_csv( os.path.join(new_path,'dataset/source/accidents-' + year + '/01-Gennaio.csv'), sep=';', encoding='latin-1')

    print(year == '2022')
    if year == '2022':
        # import and concat all following csv files
        for file in csv_2022:
            dataset = pandas.concat([dataset, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)
    else:
        for file in csv:
            dataset = pandas.concat([dataset, pandas.read_csv(file, sep=';', encoding='latin-1')], ignore_index=True)

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
    dataset['NaturaIncidente'] = dataset['NaturaIncidente'].apply(group_nature)
    dataset = dataset.loc[dataset['NaturaIncidente'] == nature]

        # select the columns of interest
    columns = ['TipoVeicolo', 'FondoStradale', 'Traffico', 'NUM_FERITI', 'NUM_MORTI', 'NUM_ILLESI', 'NUM_RISERVATA', 'Deceduto', 'CinturaCascoUtilizzato','Latitude', 'Longitude', 'NaturaIncidente', 'DataOraIncidente']

    dataset_columns = dataset[columns]

    dataset_columns['FondoStradale'] = dataset_columns['FondoStradale'].fillna('Asciutto')

    # Convert the 'DataOraIncidente' column to a datetime object
    dataset_columns['DataOraIncidente'] = pandas.to_datetime(dataset_columns['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                      errors='coerce')

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

    def group_vehicle(x):
        for key, values in groups.items():
            if x in values:
                return key

    dataset_columns['TipoVeicolo'] = dataset_columns['TipoVeicolo'].apply(group_vehicle)

    dataset_columns['TipoVeicolo'] = dataset_columns['TipoVeicolo'].fillna('Autovettura')

    accidents_data_frame = pandas.DataFrame(dataset_columns)

    def assign_severity(row):
        if row['Deceduto'] == 1:
            return 5
        elif row['NUM_FERITI'] > 4:
            return 4
        elif 2 < row['NUM_FERITI'] <= 4 and row['NUM_ILLESI'] < 3:
            return 3
        elif 1 < row['NUM_FERITI'] <= 3 and row['NUM_ILLESI'] < 2:
            return 2
        elif row['NUM_FERITI'] == 0:
            return 1
        else:
            return 1  # Default value for rows not meeting any condition

    # Apply the function to create the 'severity' column
    accidents_data_frame['Severity'] = accidents_data_frame.apply(assign_severity, axis=1)

    finalDataset = accidents_data_frame.copy()

    cols = ['QualitaFondoStradale', 'IntensitaTraffico', 'NUM_FERITI', 'NUM_MORTI', 'NUM_ILLESI', 'NUM_RISERVATA', 'UtilizzoProtezioni', 'Severity']

    # define standard scaler
    scaler = StandardScaler()
    # transform data
    scaled = scaler.fit_transform(finalDataset[cols])

    pca = PCA(n_components=2)
    components = pca.fit_transform(scaled)

    df_components = pandas.DataFrame(data=components, columns=['PC1', 'PC2'])


    df_components['Deceduto'] = accidents_data_frame['Deceduto'].values
    df_components['Severity'] = accidents_data_frame['Severity'].values
    df_components['TipoVeicolo'] = accidents_data_frame['TipoVeicolo'].values
    df_components['Latitude'] = accidents_data_frame['Latitude'].values
    df_components['Longitude'] = accidents_data_frame['Longitude'].values
    df_components['DataOraIncidente'] = accidents_data_frame['DataOraIncidente'].values

    df_components.to_csv(new_path + '/dataset/processed/scatterPlot/PCA-real-time.csv', index=False)

@app.route('/calculate_pca', methods=['GET'])
def get_pca_results():
    # Ottieni la natura dalla richiesta
    nature = request.args.get('nature')
    year = request.args.get('year')

    # Calcola la PCA per la natura specificata
    calculate_pca(nature,year)

    return 'OK', 200

if __name__ == '__main__':
    app.run(debug=True)
