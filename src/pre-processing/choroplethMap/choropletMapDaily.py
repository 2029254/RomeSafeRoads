import pandas

years = ["2019", "2020", "2021", "2022"]

for year in years:
    # import the csv file for the current year
    dataset = pandas.read_csv('dataset/source/death-accidents/deaths-' + year + '.csv', sep=',', encoding='latin-1')

    # select the columns of interest
    columns = ['Protocollo', 'Municipio', 'DataOraIncidente']

    dataset_columns = dataset[columns]

    # select the rows of interest
    dataset_rows = dataset_columns

    # Convert the 'DataOraIncidente' column to a datetime object
    dataset_rows['DataOraIncidente'] = pandas.to_datetime(dataset_rows['DataOraIncidente'], format='%d/%m/%Y %H:%M:%S',
                                                  errors='coerce')

    # export results in a new csv for the current year
    dataset_rows.to_csv('dataset/processed/choroplethMap/choroplethMapDaily' + year + '.csv', header=True)
