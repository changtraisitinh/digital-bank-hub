import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import {
  Dimensions,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from 'react-native';
import { useColorScheme } from 'react-native';
import { BarChart, PieChart } from 'react-native-chart-kit';

import { FocusAwareStatusBar, SafeAreaView, ScrollView } from '@/components/ui';

const { width } = Dimensions.get('window');

export default function Insights() {
  const colorScheme = useColorScheme();
  const isDarkMode = colorScheme === 'dark';

  // State for time period filter
  const [timePeriod, setTimePeriod] = useState('monthly');

  // Mock user data
  const userData = {
    name: 'Alex',
    balance: 5280.0,
    balanceChange: 2.5,
    spent: 1200,
    saved: 300,
    savingChange: 20,
    savingsGoal: {
      name: 'Vacation',
      current: 1200,
      target: 2000,
      monthsLeft: 3,
    },
    subscriptions: [
      { name: 'Netflix', cost: 15 },
      { name: 'Spotify', cost: 12 },
    ],
    alerts: [
      { type: 'login', location: 'Hanoi, VN', time: '2 days ago' },
      {
        type: 'transaction',
        merchant: 'Amazon',
        amount: 300,
        time: 'Yesterday',
      },
    ],
  };

  // Mock spending data
  const spendingData = {
    categories: [
      { name: 'Dining', percentage: 35, color: '#FF6384', spent: 420 },
      { name: 'Bills', percentage: 25, color: '#36A2EB', spent: 300 },
      { name: 'Transport', percentage: 20, color: '#FFCE56', spent: 240 },
      { name: 'Shopping', percentage: 15, color: '#4BC0C0', spent: 180 },
      { name: 'Other', percentage: 5, color: '#9966FF', spent: 60 },
    ],
    comparison: {
      dining: 15, // 15% increase
      bills: -5, // 5% decrease
      transport: 2,
      shopping: 8,
      other: -10,
    },
  };

  // Format currency
  const formatCurrency = (amount) => {
    return `$${amount.toFixed(2).replace(/\d(?=(\d{3})+\.)/g, '$&,')}`;
  };

  // Calculate total subscription cost
  const totalSubscriptionCost = userData.subscriptions.reduce(
    (total, sub) => total + sub.cost,
    0
  );

  // Calculate savings progress percentage
  const savingsProgress =
    (userData.savingsGoal.current / userData.savingsGoal.target) * 100;

  // Prepare pie chart data
  const pieChartData = spendingData.categories.map((category) => ({
    name: category.name,
    population: category.percentage,
    color: category.color,
    legendFontColor: isDarkMode ? '#FFF' : '#7F7F7F',
    legendFontSize: 12,
  }));

  // Prepare bar chart data for spending comparison
  const barChartData = {
    labels: ['Dining', 'Bills', 'Transport', 'Shopping', 'Other'],
    datasets: [
      {
        data: [
          spendingData.comparison.dining,
          spendingData.comparison.bills,
          spendingData.comparison.transport,
          spendingData.comparison.shopping,
          spendingData.comparison.other,
        ],
      },
    ],
  };

  // Chart configuration
  const chartConfig = {
    backgroundGradientFrom: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    backgroundGradientTo: isDarkMode ? '#1E1E1E' : '#FFFFFF',
    color: (opacity = 1) =>
      isDarkMode
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    labelColor: (opacity = 1) =>
      isDarkMode
        ? `rgba(255, 255, 255, ${opacity})`
        : `rgba(0, 0, 0, ${opacity})`,
  };

  return (
    <>
      <FocusAwareStatusBar />
      <SafeAreaView
        style={[styles.container, isDarkMode && styles.darkContainer]}
      >
        <ScrollView
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header & Financial Snapshot */}
          <View style={styles.header}>
            <Text style={[styles.greeting, isDarkMode && styles.textLight]}>
              Hello, {userData.name}!
            </Text>
            <View style={styles.balanceContainer}>
              <Text style={[styles.balance, isDarkMode && styles.textLight]}>
                {formatCurrency(userData.balance)}
              </Text>
              <View style={styles.trendContainer}>
                <Ionicons
                  name={userData.balanceChange >= 0 ? 'arrow-up' : 'arrow-down'}
                  size={16}
                  color={userData.balanceChange >= 0 ? '#4CAF50' : '#F44336'}
                />
                <Text
                  style={[
                    styles.trendText,
                    {
                      color:
                        userData.balanceChange >= 0 ? '#4CAF50' : '#F44336',
                    },
                  ]}
                >
                  {Math.abs(userData.balanceChange)}%
                </Text>
              </View>
            </View>
            <View style={styles.statsContainer}>
              <View style={styles.statItem}>
                <Text
                  style={[styles.statLabel, isDarkMode && styles.textLight]}
                >
                  Spent
                </Text>
                <Text
                  style={[styles.statValue, isDarkMode && styles.textLight]}
                >
                  {formatCurrency(userData.spent)}
                </Text>
              </View>
              <View style={styles.statDivider} />
              <View style={styles.statItem}>
                <Text
                  style={[styles.statLabel, isDarkMode && styles.textLight]}
                >
                  Saved
                </Text>
                <View style={styles.statValueContainer}>
                  <Text
                    style={[styles.statValue, isDarkMode && styles.textLight]}
                  >
                    {formatCurrency(userData.saved)}
                  </Text>
                  <Ionicons
                    name="arrow-up"
                    size={12}
                    color="#4CAF50"
                    style={styles.statIcon}
                  />
                  <Text style={styles.statChangeText}>
                    {userData.savingChange}%
                  </Text>
                </View>
              </View>
            </View>
          </View>

          {/* Time Period Filter */}
          <View style={styles.filterContainer}>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timePeriod === 'weekly' && styles.activeFilterButton,
              ]}
              onPress={() => setTimePeriod('weekly')}
            >
              <Text
                style={[
                  styles.filterText,
                  timePeriod === 'weekly' && styles.activeFilterText,
                  isDarkMode && timePeriod !== 'weekly' && styles.textLight,
                ]}
              >
                Weekly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timePeriod === 'monthly' && styles.activeFilterButton,
              ]}
              onPress={() => setTimePeriod('monthly')}
            >
              <Text
                style={[
                  styles.filterText,
                  timePeriod === 'monthly' && styles.activeFilterText,
                  isDarkMode && timePeriod !== 'monthly' && styles.textLight,
                ]}
              >
                Monthly
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[
                styles.filterButton,
                timePeriod === 'yearly' && styles.activeFilterButton,
              ]}
              onPress={() => setTimePeriod('yearly')}
            >
              <Text
                style={[
                  styles.filterText,
                  timePeriod === 'yearly' && styles.activeFilterText,
                  isDarkMode && timePeriod !== 'yearly' && styles.textLight,
                ]}
              >
                Yearly
              </Text>
            </TouchableOpacity>
          </View>

          {/* Spending Insights Section */}
          <View
            style={[
              styles.sectionContainer,
              isDarkMode && styles.darkSectionContainer,
            ]}
          >
            <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
              Spending Breakdown
            </Text>

            {/* Pie Chart */}
            <View style={styles.chartContainer}>
              <PieChart
                data={pieChartData}
                width={width - 64}
                height={180}
                chartConfig={chartConfig}
                accessor="population"
                backgroundColor="transparent"
                paddingLeft="15"
                absolute
              />
            </View>

            {/* Comparison with last period */}
            <Text
              style={[styles.comparisonTitle, isDarkMode && styles.textLight]}
            >
              Compared to Last{' '}
              {timePeriod === 'weekly'
                ? 'Week'
                : timePeriod === 'monthly'
                  ? 'Month'
                  : 'Year'}
            </Text>

            <View style={styles.barChartContainer}>
              <BarChart
                data={barChartData}
                width={width - 64}
                height={180}
                chartConfig={{
                  ...chartConfig,
                  barPercentage: 0.7,
                  color: (opacity = 1) => `rgba(76, 175, 80, ${opacity})`,
                }}
                style={styles.barChart}
                showValuesOnTopOfBars
                fromZero
                withInnerLines={false}
              />
            </View>

            <Text style={[styles.insightText, isDarkMode && styles.textLight]}>
              You spent 15% more on Dining compared to last{' '}
              {timePeriod === 'weekly'
                ? 'week'
                : timePeriod === 'monthly'
                  ? 'month'
                  : 'year'}
              .
            </Text>
          </View>

          {/* Subscriptions Section */}
          <View
            style={[
              styles.sectionContainer,
              isDarkMode && styles.darkSectionContainer,
            ]}
          >
            <View style={styles.sectionHeaderRow}>
              <Text
                style={[styles.sectionTitle, isDarkMode && styles.textLight]}
              >
                Recurring Subscriptions
              </Text>
              <Ionicons name="notifications" size={20} color="#FF9800" />
            </View>

            {userData.subscriptions.map((sub, index) => (
              <View key={index} style={styles.subscriptionItem}>
                <View style={styles.subscriptionInfo}>
                  <Text
                    style={[
                      styles.subscriptionName,
                      isDarkMode && styles.textLight,
                    ]}
                  >
                    {sub.name}
                  </Text>
                  <Text
                    style={[
                      styles.subscriptionCost,
                      isDarkMode && styles.textLight,
                    ]}
                  >
                    ${sub.cost}/month
                  </Text>
                </View>
                <TouchableOpacity style={styles.manageButton}>
                  <Text style={styles.manageButtonText}>Manage</Text>
                </TouchableOpacity>
              </View>
            ))}

            <TouchableOpacity style={styles.cancelButton}>
              <Text style={styles.cancelButtonText}>
                Cancel Unused & Save ${totalSubscriptionCost}/month
              </Text>
            </TouchableOpacity>
          </View>

          {/* Savings & Goals Section */}
          <View
            style={[
              styles.sectionContainer,
              isDarkMode && styles.darkSectionContainer,
            ]}
          >
            <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
              Savings Goal
            </Text>

            <View style={styles.goalContainer}>
              <View style={styles.goalInfo}>
                <Text style={[styles.goalName, isDarkMode && styles.textLight]}>
                  {userData.savingsGoal.name}
                </Text>
                <Text
                  style={[styles.goalProgress, isDarkMode && styles.textLight]}
                >
                  {formatCurrency(userData.savingsGoal.current)} of{' '}
                  {formatCurrency(userData.savingsGoal.target)}
                </Text>
              </View>

              <View style={styles.progressBarContainer}>
                <View
                  style={[styles.progressBar, { width: `${savingsProgress}%` }]}
                />
              </View>

              <Text
                style={[styles.goalTimeLeft, isDarkMode && styles.textLight]}
              >
                {userData.savingsGoal.monthsLeft} months left at this rate
              </Text>
            </View>

            <View style={styles.suggestionContainer}>
              <View style={styles.suggestionIcon}>
                <Ionicons name="bulb" size={24} color="#FFD700" />
              </View>
              <View style={styles.suggestionContent}>
                <Text
                  style={[
                    styles.suggestionTitle,
                    isDarkMode && styles.textLight,
                  ]}
                >
                  Smart Suggestion
                </Text>
                <Text
                  style={[
                    styles.suggestionText,
                    isDarkMode && styles.textLight,
                  ]}
                >
                  Round up purchases to save $50/month!
                </Text>
              </View>
            </View>

            <TouchableOpacity style={styles.enableButton}>
              <Text style={styles.enableButtonText}>Enable Round-Ups</Text>
            </TouchableOpacity>
          </View>

          {/* Security & Alerts Section */}
          <View
            style={[
              styles.sectionContainer,
              isDarkMode && styles.darkSectionContainer,
            ]}
          >
            <Text style={[styles.sectionTitle, isDarkMode && styles.textLight]}>
              Security & Alerts
            </Text>

            {userData.alerts.map((alert, index) => (
              <View key={index} style={styles.alertItem}>
                <View style={styles.alertIconContainer}>
                  <Ionicons
                    name={
                      alert.type === 'login' ? 'shield-outline' : 'card-outline'
                    }
                    size={24}
                    color="#F44336"
                  />
                </View>
                <View style={styles.alertContent}>
                  <Text
                    style={[styles.alertTitle, isDarkMode && styles.textLight]}
                  >
                    {alert.type === 'login'
                      ? `New Login from ${alert.location}`
                      : `$${alert.amount} at ${alert.merchant}`}
                  </Text>
                  <Text style={styles.alertTime}>{alert.time}</Text>
                </View>
                <View style={styles.alertActions}>
                  <TouchableOpacity style={styles.alertActionButton}>
                    <Text style={styles.alertActionText}>
                      {alert.type === 'login' ? 'This was me' : 'Expected'}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.alertActionButton, styles.reportButton]}
                  >
                    <Text style={styles.reportButtonText}>Report</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
          </View>

          {/* Bottom Actions */}
          <View style={styles.bottomActions}>
            <TouchableOpacity style={styles.actionButton}>
              <Ionicons
                name="document-text-outline"
                size={20}
                color="#FFFFFF"
              />
              <Text style={styles.actionButtonText}>Full Report</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.actionButton, styles.advisorButton]}
            >
              <Ionicons name="chatbubbles-outline" size={20} color="#FFFFFF" />
              <Text style={styles.actionButtonText}>Get Advice</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      </SafeAreaView>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#F5F7FA',
  },
  darkContainer: {
    backgroundColor: '#121212',
  },
  scrollContent: {
    paddingBottom: 24,
  },
  header: {
    padding: 16,
    backgroundColor: '#FFFFFF',
    borderBottomLeftRadius: 16,
    borderBottomRightRadius: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  greeting: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
    color: '#333333',
  },
  balanceContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  balance: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#333333',
    marginRight: 8,
  },
  trendContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(76, 175, 80, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  trendText: {
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 2,
  },
  statsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statItem: {
    flex: 1,
  },
  statDivider: {
    width: 1,
    height: 24,
    backgroundColor: '#E0E0E0',
    marginHorizontal: 16,
  },
  statLabel: {
    fontSize: 14,
    color: '#757575',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
  },
  statValueContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statIcon: {
    marginLeft: 4,
  },
  statChangeText: {
    fontSize: 12,
    color: '#4CAF50',
    marginLeft: 2,
  },
  filterContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 16,
    marginBottom: 8,
  },
  filterButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginHorizontal: 4,
  },
  activeFilterButton: {
    backgroundColor: '#2E7D32',
  },
  filterText: {
    fontSize: 14,
    color: '#757575',
  },
  activeFilterText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
  },
  sectionContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginHorizontal: 16,
    marginTop: 16,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  darkSectionContainer: {
    backgroundColor: '#1E1E1E',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333333',
    marginBottom: 16,
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  chartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  comparisonTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 8,
  },
  barChartContainer: {
    alignItems: 'center',
    marginBottom: 16,
  },
  barChart: {
    borderRadius: 16,
  },
  insightText: {
    fontSize: 14,
    color: '#757575',
    fontStyle: 'italic',
  },
  subscriptionItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  subscriptionInfo: {
    flex: 1,
  },
  subscriptionName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  subscriptionCost: {
    fontSize: 14,
    color: '#757575',
  },
  manageButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
  },
  manageButtonText: {
    fontSize: 12,
    color: '#616161',
  },
  cancelButton: {
    backgroundColor: '#FFEBEE',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginTop: 16,
  },
  cancelButtonText: {
    color: '#F44336',
    fontWeight: '500',
  },
  goalContainer: {
    marginBottom: 16,
  },
  goalInfo: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  goalName: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
  },
  goalProgress: {
    fontSize: 16,
    color: '#333333',
  },
  progressBarContainer: {
    height: 12,
    backgroundColor: '#E0E0E0',
    borderRadius: 6,
    marginBottom: 8,
    overflow: 'hidden',
  },
  progressBar: {
    height: '100%',
    backgroundColor: '#4CAF50',
    borderRadius: 6,
  },
  goalTimeLeft: {
    fontSize: 14,
    color: '#757575',
    textAlign: 'right',
  },
  suggestionContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFF8E1',
    borderRadius: 12,
    padding: 12,
    marginTop: 16,
    marginBottom: 16,
  },
  suggestionIcon: {
    marginRight: 12,
  },
  suggestionContent: {
    flex: 1,
  },
  suggestionTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  suggestionText: {
    fontSize: 14,
    color: '#757575',
  },
  enableButton: {
    backgroundColor: '#E8F5E9',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
  },
  enableButtonText: {
    color: '#2E7D32',
    fontWeight: '500',
  },
  alertItem: {
    flexDirection: 'row',
    marginBottom: 16,
  },
  alertIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: '#FFEBEE',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  alertContent: {
    flex: 1,
    justifyContent: 'center',
  },
  alertTitle: {
    fontSize: 16,
    fontWeight: '500',
    color: '#333333',
    marginBottom: 4,
  },
  alertTime: {
    fontSize: 12,
    color: '#757575',
  },
  alertActions: {
    flexDirection: 'row',
    marginTop: 8,
  },
  alertActionButton: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  alertActionText: {
    fontSize: 12,
    color: '#616161',
  },
  reportButton: {
    backgroundColor: '#FFEBEE',
  },
  reportButtonText: {
    color: '#F44336',
  },
  bottomActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 16,
    marginTop: 24,
  },
  actionButton: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#2E7D32',
    borderRadius: 12,
    paddingVertical: 14,
    marginHorizontal: 4,
  },
  advisorButton: {
    backgroundColor: '#1976D2',
  },
  actionButtonText: {
    color: '#FFFFFF',
    fontWeight: 'bold',
    marginLeft: 8,
  },
  textLight: {
    color: '#FFFFFF',
  },
});
