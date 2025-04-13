# StockSightAI Technical Documentation

This document provides a detailed technical explanation of all calculations, AI models, statistical methods, and APIs used in the StockSightAI inventory management and forecasting system.

## Table of Contents

1. [System Overview](#system-overview)
2. [Data Sources and APIs](#data-sources-and-apis)
3. [Machine Learning Models](#machine-learning-models)
4. [Statistical Methods and Calculations](#statistical-methods-and-calculations)
5. [Forecasting Algorithms](#forecasting-algorithms)
6. [Frontend Visualization and Metrics](#frontend-visualization-and-metrics)

## System Overview

StockSightAI is an integrated inventory management system with advanced forecasting capabilities. The system combines:

- **Inventory Management**: Track items, quantities, prices, and reorder points
- **Sales Tracking**: Record and manage sales transactions
- **Purchase Orders**: Create and manage purchase orders for restocking
- **Forecasting**: Predict future sales and profits using AI and statistical models
- **Industry Health Analysis**: Incorporate external economic data to improve forecasts

The system architecture consists of:
- **Frontend**: React with TypeScript, using Recharts for data visualization
- **Backend**: Flask (Python) with RESTful API endpoints
- **Database**: MongoDB for storing inventory, sales, and purchase order data
- **Machine Learning**: Python-based ML models for classification and forecasting

## Data Sources and APIs

### MongoDB Collections

The system uses MongoDB with the following collections:
- `inventory`: Stores item details (SKU, name, quantity, prices, etc.)
- `sales`: Records sales transactions
- `purchase_orders`: Manages purchase orders
- `item_categories`: Caches item category classifications

### SingStat API Integration

The system integrates with Singapore's Department of Statistics (SingStat) API to retrieve economic indicators that help improve forecast accuracy.

**API Implementation:**

The system fetches data from SingStat API using HTTP requests with the following parameters:
- URL: `https://tablebuilder.singstat.gov.sg/api/table/tabledata/{resource_id}?offset=0&limit=10000`
- Headers: User-Agent and Accept headers for JSON response
- Response: JSON data containing quarterly economic indicators

**Resource IDs Used:**
- `M250141`: Manufacturing sector data
- `M250431`: Services sector data

The API data is processed to extract quarterly performance indicators for different industry sectors, which are then used as external factors in the forecasting models.

### Data Processing Pipeline

1. **Raw Data Collection**:
   - Sales transactions from MongoDB
   - Industry health indicators from SingStat API

2. **Data Aggregation**:
   - Weekly sales aggregation: Groups sales by item, SKU, year, and week
   - Monthly sales aggregation: Derived from weekly data
   - Yearly sales aggregation: Derived from weekly data

3. **Data Transformation**:
   - Calculation of industry health coefficients
   - Normalization of external indicators to 0-0.5 range
   - Categorization of items using ML model

## Machine Learning Models

### Item Category Classification

The system uses a machine learning model to automatically classify inventory items into industry categories, which helps in applying the appropriate industry health coefficients.

**Model Architecture:**
- **Embedding Model**: Sentence Transformer (`all-MiniLM-L6-v2`)
- **Classifier**: Support Vector Machine (SVM) with linear kernel

**Mathematical Formulation:**

1. **Text Embedding**: Item names are converted to dense vector representations using a pre-trained sentence transformer:
   
   $\vec{x}_i = \text{Encoder}(\text{item\_name}_i)$

2. **SVM Classification**: The SVM classifier finds a hyperplane that maximizes the margin between different categories:
   
   $f(\vec{x}) = \vec{w} \cdot \vec{x} + b$
   
   where $\vec{w}$ is the normal vector to the hyperplane and $b$ is the bias term.

3. **Optimization Problem**:
   
   $\min_{\vec{w}, b} \frac{1}{2} \|\vec{w}\|^2$
   
   subject to $y_i(\vec{w} \cdot \vec{x}_i + b) \geq 1$ for all training examples $i$

**Performance Metrics:**
- Cross-validation scores
- Classification report (precision, recall, F1-score)
- Confusion matrix visualization

### Industry Health Prediction Models

Linear regression models are trained for each industry category to predict future health coefficients based on historical data.

**Mathematical Formulation:**

For each industry category, a linear regression model is trained to predict future health coefficients:

$y = \beta_0 + \beta_1 x + \varepsilon$

where:
- $y$ is the industry health coefficient
- $x$ is the year
- $\beta_0$ is the intercept
- $\beta_1$ is the slope (annual rate of change)
- $\varepsilon$ is the error term

The parameters $\beta_0$ and $\beta_1$ are estimated by minimizing the sum of squared residuals:

$\min_{\beta_0, \beta_1} \sum_{i=1}^{n} (y_i - \beta_0 - \beta_1 x_i)^2$

## Statistical Methods and Calculations

### Industry Health Coefficient

The industry health coefficient is a key factor in the forecasting models, representing the economic health of different industry sectors.

**Mathematical Formula:**

The industry health coefficient is calculated as:

$\text{IHC}_{c,y,q} = \text{Normalize}(\text{CumulativeAvg}_{c,y,q})$

where:
- $\text{IHC}_{c,y,q}$ is the industry health coefficient for category $c$, year $y$, and quarter $q$
- $\text{CumulativeAvg}_{c,y,q}$ is the cumulative average of raw values up to the specified quarter

The normalization function scales the value to a 0-0.5 range:

$\text{Normalize}(x) = \frac{x - \min(x)}{\max(x) - \min(x)} \times 0.5$

For future periods, a growth factor is applied based on recent trends:

$\text{IHC}_{c,y+\Delta,q} = \text{IHC}_{c,y,q} + \text{Growth}_{c} \times \Delta$

where $\text{Growth}_{c}$ is the average growth rate for category $c$ and $\Delta$ is the number of periods ahead.

The coefficient is calculated by:
1. Retrieving raw quarterly data for the specific category
2. Calculating cumulative average up to the target quarter
3. Normalizing the value to a 0-0.5 range
4. For future periods, applying a growth factor based on recent trends

### Yearly Averages Calculation

**Mathematical Formula:**

The yearly average calculation involves two main steps:

1. **Quarterly to Yearly Aggregation**:
   
   For each category $c$ and year $y$:
   
   $\text{YearlyAvg}_{c,y} = \frac{1}{n_{c,y}} \sum_{q=1}^{4} \text{QuarterlyValue}_{c,y,q}$
   
   where $n_{c,y}$ is the number of available quarterly values for category $c$ in year $y$.

2. **Normalization to 0-0.5 Range**:
   
   For each category $c$:
   
   $\text{NormalizedCoef}_{c,y} = \frac{\text{YearlyAvg}_{c,y} - \min_{y'}(\text{YearlyAvg}_{c,y'})}{\max_{y'}(\text{YearlyAvg}_{c,y'}) - \min_{y'}(\text{YearlyAvg}_{c,y'})} \times 0.5$
   
   where $\min_{y'}$ and $\max_{y'}$ represent the minimum and maximum values across all years for category $c$.

### Holiday Boost Factors

The system incorporates holiday boost factors to account for seasonal sales increases:

**Holiday Boost Factors:**

The system applies multiplicative factors to sales predictions during holiday periods:

$\text{AdjustedSales} = \text{BaseSales} \times (1 + \text{HolidayBoost})$

where $\text{HolidayBoost}$ is defined as:

| Holiday | Boost Factor |
|---------|--------------|
| Christmas | 0.20 (20%) |
| Black Friday | 0.15 (15%) |
| New Year | 0.10 (10%) |
| Valentine's Day | 0.05 (5%) |
| Easter | 0.05 (5%) |

## Forecasting Algorithms

### SARIMAX Time Series Forecasting

For items with sufficient historical data, the system uses SARIMAX (Seasonal AutoRegressive Integrated Moving Average with eXogenous factors) for forecasting.

**Mathematical Formulation:**

The SARIMAX model combines autoregressive, moving average, and seasonal components with exogenous variables:

$y_t = c + \sum_{i=1}^{p} \phi_i y_{t-i} + \sum_{i=1}^{q} \theta_i \varepsilon_{t-i} + \sum_{i=1}^{P} \Phi_i y_{t-i \times s} + \sum_{i=1}^{Q} \Theta_i \varepsilon_{t-i \times s} + \sum_{i=1}^{r} \beta_i X_{i,t} + \varepsilon_t$

where:
- $y_t$ is the sales value at time $t$
- $c$ is a constant term
- $\phi_i$ are the autoregressive parameters (order $p=1$)
- $\theta_i$ are the moving average parameters (order $q=1$)
- $\Phi_i$ are the seasonal autoregressive parameters (order $P=1$)
- $\Theta_i$ are the seasonal moving average parameters (order $Q=1$)
- $s$ is the seasonal period (52 for weekly, 12 for monthly, 1 for yearly)
- $\beta_i$ are the coefficients for exogenous variables
- $X_{i,t}$ are the exogenous variables (industry health coefficient)
- $\varepsilon_t$ is the error term at time $t$

**Key Parameters:**
- **order=(1,0,1)**: ARIMA parameters (p,d,q)
  - p=1: Autoregressive order
  - d=0: Integration order (no differencing)
  - q=1: Moving average order
- **seasonal_order=(1,0,1,seasonal_period)**: Seasonal component
  - Seasonal period depends on time frame (52 for weekly, 12 for monthly, 1 for yearly)

**Exogenous Variables:**
- Industry health coefficient: Derived from SingStat data
- Future coefficients are predicted using linear regression models

### Linear Growth Model for Limited Data

For items with limited historical data (less than 3 data points), a simpler linear growth model is used:

**Mathematical Formulation:**

For items with limited historical data, a linear growth model is used:

1. **Historical Growth Rate Calculation**:
   
   $r_{\text{hist}} = \left(\frac{y_{\text{last}}}{y_{\text{first}}}\right)^{\frac{1}{n-1}} - 1$
   
   where:
   - $y_{\text{last}}$ is the most recent sales value
   - $y_{\text{first}}$ is the oldest sales value
   - $n$ is the number of data points

2. **Industry-Adjusted Growth Rate**:
   
   $r_{\text{adj}} = r_{\text{hist}} \times (1 + \text{IHC}_{c,y,q})$
   
   where $\text{IHC}_{c,y,q}$ is the industry health coefficient for category $c$, year $y$, and quarter $q$

3. **Future Value Prediction**:
   
   $y_{t+k} = y_t \times (1 + r_{\text{adj}})^k$
   
   where:
   - $y_t$ is the current sales value
   - $k$ is the number of periods ahead
   - $r_{\text{adj}}$ is the industry-adjusted growth rate

### Confidence Interval Calculation

The system calculates confidence intervals for all forecasts:

**Mathematical Formulation:**

**For SARIMAX models:**

The 95% confidence intervals are calculated based on the model's standard errors:

$\text{CI}_{t+k} = \hat{y}_{t+k} \pm 1.96 \times \text{SE}(\hat{y}_{t+k})$

where:
- $\hat{y}_{t+k}$ is the predicted value at time $t+k$
- $\text{SE}(\hat{y}_{t+k})$ is the standard error of the prediction
- 1.96 is the z-score for a 95% confidence level

**For linear growth models:**

1. **Growth Rate Variability**:
   
   $\sigma_r = \sqrt{\frac{1}{n-1} \sum_{i=1}^{n-1} (r_i - \bar{r})^2}$
   
   where:
   - $r_i = \frac{y_{i+1}}{y_i} - 1$ is the period-to-period growth rate
   - $\bar{r}$ is the mean growth rate
   - $n$ is the number of data points

2. **Confidence Interval Calculation**:
   
   $\text{CI}_{t+k} = \hat{y}_{t+k} \pm 1.96 \times \sigma_r \times \sqrt{k} \times \hat{y}_{t+k}$
   
   where:
   - $\hat{y}_{t+k}$ is the predicted value at time $t+k$
   - $\sigma_r$ is the standard deviation of growth rates
   - $k$ is the number of periods ahead
   - 1.96 is the z-score for a 95% confidence level
   - The confidence interval widens as $k$ increases (square root scaling)

## Frontend Visualization and Metrics

### Sales Metrics Calculation

The frontend calculates several key metrics based on the forecast data:

**Mathematical Formulation:**

**Predicted Sales and Growth Rate:**

The growth rate is calculated as the percentage change between consecutive periods:

$\text{GrowthRate} = \frac{y_{\text{current}} - y_{\text{previous}}}{y_{\text{previous}}} \times 100\%$

where:
- $y_{\text{current}}$ is the predicted value for the current period
- $y_{\text{previous}}$ is the value from the previous period

**Forecast Confidence Level:**

The confidence level is calculated based on the coefficient of variation (CV) of historical data:

1. **Mean and Variance Calculation**:
   
   $\mu = \frac{1}{n} \sum_{i=1}^{n} y_i$
   
   $\sigma^2 = \frac{1}{n} \sum_{i=1}^{n} (y_i - \mu)^2$

2. **Coefficient of Variation**:
   
   $\text{CV} = \frac{\sigma}{\mu}$

3. **Time Frame-Specific Scaling**:
   
   $S_{\text{tf}} = \begin{cases}
   3 & \text{if time frame is weekly} \\
   5 & \text{if time frame is monthly} \\
   8 & \text{if time frame is yearly}
   \end{cases}$

4. **Data Point Factor**:
   
   $F_{\text{dp}} = \min(1, \frac{n}{10})$

5. **Confidence Level Calculation**:
   
   $\text{Confidence} = \max(0, \min(100, 100 - \text{CV} \times S_{\text{tf}} \times 100 \times F_{\text{dp}}))$

This formula produces higher confidence levels for data with lower relative variability and more data points.

### Industry Health Visualization

The Dashboard component displays industry health trends using cumulative averages:

**Mathematical Formulation:**

The cumulative average for each sector is calculated as:

$\text{CumulativeAvg}_{c,t} = \frac{1}{t} \sum_{i=1}^{t} v_{c,i}$

where:
- $\text{CumulativeAvg}_{c,t}$ is the cumulative average for category $c$ at time point $t$
- $v_{c,i}$ is the raw value for category $c$ at time point $i$
- $t$ is the number of time points included in the calculation

This approach gives equal weight to all historical values and produces a smoothed trend that reduces the impact of short-term fluctuations while preserving long-term patterns.

The cumulative average approach helps smooth out short-term fluctuations and highlight long-term trends in industry performance.

### Top Products Prediction

The system identifies products with the highest predicted growth potential:

**Mathematical Formulation:**

The top products prediction is based on the industry health coefficient:

1. **Predicted Increase Calculation**:
   
   $\text{PredictedIncrease}_p = \text{IHC}_{c(p)} \times 100\%$
   
   where:
   - $\text{PredictedIncrease}_p$ is the predicted percentage increase for product $p$
   - $\text{IHC}_{c(p)}$ is the industry health coefficient for the category of product $p$
   - The multiplication by 100 converts the decimal coefficient to a percentage

2. **Product Ranking**:
   
   Products are ranked by their predicted increase values, and the top 5 are selected:
   
   $\text{TopProducts} = \text{Top}_5(\{p_1, p_2, ..., p_n\}, \text{PredictedIncrease})$
   
   where $\text{Top}_5$ selects the 5 products with the highest predicted increase values.

This approach leverages the industry health indicators as a proxy for product-specific growth potential, allowing businesses to focus on products in the most promising industry sectors.

This calculation uses the industry health coefficient as a direct predictor of product growth potential, helping businesses focus on products with the highest growth opportunities.

---

This documentation provides a comprehensive overview of the technical implementation of StockSightAI, including all calculations, AI models, statistical methods, and APIs used in the system. The integration of external economic data from SingStat with internal sales data, combined with advanced forecasting algorithms, enables accurate predictions that help businesses optimize inventory management and sales strategies.
