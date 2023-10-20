import pandas

years = ["2019", "2020", "2021", "2022"]
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
           'Veicolo in marcia contro ostacolo accidentale'],
    'C6': ['Infortunio per sola frenata improvvisa',
           'Infortunio per caduta del veicolo'],
    'C7': ['Fuoriuscita dalla sede stradale',
           'Ribaltamento senza urto contro ostacolo fisso'],
    'C8': ['Veicolo in marcia contro treno',
           'Veicolo in marcia contro animale',
           'Scontro frontale/laterale SX fra veicoli in marcia',
           'Scontro frontale/laterale DX fra veicoli in marcia']
}

for year in years:
    # import the csv file for the current year
    dataset = pandas.read_csv('dataset/source/death-accidents/deaths-' + year + '.csv', sep=',', encoding='latin-1')

    # select the columns of interest
    columns = ['Protocollo', 'Municipio', 'NaturaIncidente', 'CondizioneAtmosferica']
    dataset_columns = dataset[columns]

    # select the rows of interest
    dataset_rows = dataset_columns

    # function to assign nature to a group
    def group_nature(x):
        for key, values in groups.items():
            if x in values:
                return key


    # creation of new columns calling function groupNature
    dataset_rows['NaturaIncidente'] = dataset_rows['NaturaIncidente'].apply(group_nature)


    # creation of dataframe (two-dimensional data structure) to organize a table with rows and columns
    accidents_data_frame = pandas.DataFrame(dataset_rows)

    # export results in a new csv for the current year
    accidents_data_frame.to_csv('dataset/processed/choroplethMap/choroplethMapNature' + year + '.csv', header=True)
