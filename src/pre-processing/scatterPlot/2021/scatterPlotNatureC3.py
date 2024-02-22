import pandas as pd
from sklearn.decomposition import PCA
from sklearn.discriminant_analysis import StandardScaler

dataset = pd.read_csv('dataset/processed/scatterPlot/Data/scatterPlotNatureC3-2021.csv')
cols = ['QualitaFondoStradale', 'IntensitaTraffico', 'NUM_FERITI', 'NUM_MORTI', 'NUM_ILLESI', 'NUM_RISERVATA', 'UtilizzoProtezioni']

# define standard scaler
scaler = StandardScaler()
# transform data
scaled = scaler.fit_transform(dataset[cols])

pca = PCA(n_components=2)
components = pca.fit_transform(scaled)
principal_components = pca.components_
df_components = pd.DataFrame(data=components, columns=['PC1', 'PC2'])

df_components['Deceduto'] = dataset['Deceduto']
df_components['TipoVeicolo'] = dataset['TipoVeicolo']
df_components['Latitude'] = dataset['Latitude']
df_components['Longitude'] = dataset['Longitude']

df_components.to_csv('dataset/processed/scatterPlot/2021/scatterPlotNatureC3.csv', index=False)