import React, { useState, useEffect } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  ScrollView, 
  TouchableOpacity, 
  ActivityIndicator 
} from 'react-native';
import { walletAPI } from '../services/api';

const WalletScreen = ({ navigation }) => {
  const [balance, setBalance] = useState(0);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWalletData();
  }, []);

  const loadWalletData = async () => {
    try {
      const balanceData = await walletAPI.getBalance();
      setBalance(balanceData.balance || 0);

      const transactionsData = await walletAPI.getTransactions();
      setTransactions(transactionsData.transactions || []);
    } catch (error) {
      console.error('Error loading wallet data:', error);
      // Mock data for now
      setBalance(5000);
      setTransactions([
        {
          id: 1,
          type: 'credit',
          amount: 5000,
          description: 'Property booking payment',
          date: '2024-01-15',
        },
        {
          id: 2,
          type: 'debit',
          amount: 2000,
          description: 'Service fee',
          date: '2024-01-14',
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const renderTransaction = ({ item }) => (
    <View style={[
      styles.transactionCard,
      item.type === 'credit' ? styles.creditTransaction : styles.debitTransaction
    ]}>
      <View style={styles.transactionInfo}>
        <Text style={styles.transactionDescription}>{item.description}</Text>
        <Text style={styles.transactionDate}>{item.date}</Text>
      </View>
      <Text style={[
        styles.transactionAmount,
        item.type === 'credit' ? styles.creditAmount : styles.debitAmount
      ]}>
        {item.type === 'credit' ? '+' : '-'}KES {item.amount.toLocaleString()}
      </Text>
    </View>
  );

  if (loading) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator color="#fbbf24" size="large" />
      </View>
    );
  }

  return (
    <ScrollView style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>AXX Wallet</Text>
        <Text style={styles.headerSubtitle}>Manage your finances</Text>
      </View>

      <View style={styles.balanceCard}>
        <Text style={styles.balanceLabel}>Available Balance</Text>
        <Text style={styles.balanceAmount}>KES {balance.toLocaleString()}</Text>
        <TouchableOpacity style={styles.addMoneyButton}>
          <Text style={styles.addMoneyButtonText}>+ Add Money</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.actionsContainer}>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>💳</Text>
          <Text style={styles.actionText}>Top Up</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📤</Text>
          <Text style={styles.actionText}>Withdraw</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>📋</Text>
          <Text style={styles.actionText}>History</Text>
        </TouchableOpacity>
        <TouchableOpacity style={styles.actionButton}>
          <Text style={styles.actionIcon}>⚙️</Text>
          <Text style={styles.actionText}>Settings</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Recent Transactions</Text>
        {transactions.map(transaction => (
          <View key={transaction.id}>
            {renderTransaction({ item: transaction })}
          </View>
        ))}
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#0f1729',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#1e293b',
    marginBottom: 20,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#fbbf24',
    marginBottom: 5,
  },
  headerSubtitle: {
    fontSize: 14,
    color: '#94a3b8',
  },
  balanceCard: {
    backgroundColor: '#1e293b',
    borderRadius: 16,
    padding: 25,
    margin: 20,
    borderWidth: 2,
    borderColor: '#fbbf24',
  },
  balanceLabel: {
    color: '#94a3b8',
    fontSize: 14,
    marginBottom: 10,
  },
  balanceAmount: {
    color: '#fbbf24',
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  addMoneyButton: {
    backgroundColor: '#fbbf24',
    borderRadius: 8,
    padding: 12,
    alignItems: 'center',
  },
  addMoneyButtonText: {
    color: '#0f1729',
    fontSize: 16,
    fontWeight: 'bold',
  },
  actionsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: 20,
    marginBottom: 30,
  },
  actionButton: {
    alignItems: 'center',
  },
  actionIcon: {
    fontSize: 28,
    marginBottom: 5,
  },
  actionText: {
    color: '#ffffff',
    fontSize: 12,
  },
  section: {
    paddingHorizontal: 20,
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#ffffff',
    marginBottom: 15,
  },
  transactionCard: {
    backgroundColor: '#1e293b',
    borderRadius: 12,
    padding: 15,
    marginBottom: 10,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  creditTransaction: {
    borderLeftWidth: 4,
    borderLeftColor: '#22c55e',
  },
  debitTransaction: {
    borderLeftWidth: 4,
    borderLeftColor: '#ef4444',
  },
  transactionInfo: {
    flex: 1,
  },
  transactionDescription: {
    color: '#ffffff',
    fontSize: 14,
    marginBottom: 5,
  },
  transactionDate: {
    color: '#94a3b8',
    fontSize: 12,
  },
  transactionAmount: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  creditAmount: {
    color: '#22c55e',
  },
  debitAmount: {
    color: '#ef4444',
  },
});

export default WalletScreen;
