import pandas

years = ["2019", "2020", "2021", "2022"]

for year in years:
    # import the csv file for the current year
    dataset = pandas.read_csv('dataset/source/death-accidents/deaths-' + year + '.csv', sep=',', encoding='latin-1')

    # select the columns of interest
    columns = ['Protocollo', 'Municipio', 'CondizioneAtmosferica']

    dataset_columns = dataset[columns]

    # select the rows of interest
    dataset_rows = dataset_columns.loc[dataset_columns['CondizioneAtmosferica'].isin(['Nuvoloso'])]

    # count of deaths for each town hall
    town_hall_count = dataset_rows.groupby('Municipio')['Protocollo'].count()

    # creation of dataframe (two-dimensional data structure) to organize a table with rows and columns
    accidents_data_frame = pandas.DataFrame(town_hall_count)

    # renames of columns
    accidents_data_frame.rename(columns={"Protocollo": "NumeroIncidenti"}, inplace=True)

    # export results in a new csv for the current year
    accidents_data_frame.to_csv('dataset/processed/weather/' + year + '/deaths/deathsAccidentsCloudy' + year + '.csv', header=True)
