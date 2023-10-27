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
    columns = ['Protocollo', 'Municipio', 'NaturaIncidente', 'CondizioneAtmosferica', 'DataOraIncidente']
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


    # Convert the 'DataOraIncidente' column to a datetime object
    dataset_rows['DataOraIncidente'] = pandas.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                          errors='coerce')

    dataset_rows.dropna(subset=['DataOraIncidente'], inplace=True)


    # Define a function to round the date to the nearest 10 days
    def round_date_to_10_days(date):
        day = 10
        month = date.month
        year = date.year
        if date == 1/1/2019:
            day = 1
        elif date.day < 10:
            day = 10
        elif date.day < 20:
            day = 20
        elif date.day > 20 and date.month < 12:
            day = 1
            month = month + 1
        else:
            day = 1
            month = month
        return pandas.to_datetime(f"{day}/{month}/{year}", format='%d/%m/%Y')


    # Apply the function to round the date
    dataset_rows['DataOraIncidente'] = dataset_rows['DataOraIncidente'].apply(round_date_to_10_days)
    # creation of dataframe (two-dimensional data structure) to organize a table with rows and columns
    accidents_data_frame = pandas.DataFrame(dataset_rows)

    # export results in a new csv for the current year
    accidents_data_frame.to_csv('dataset/processed/choroplethMap/choroplethMapNature' + year + '.csv', header=True)
