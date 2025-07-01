import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  FlatList,
  Alert,
  RefreshControl,
} from 'react-native';
import { Card, Button, Searchbar, FAB, Chip, RadioButton, ProgressBar } from 'react-native-paper';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { useQuery, useMutation, useQueryClient } from 'react-query';

import { Colors } from '../utils/colors';
import { PollsService } from '../services/PollsService';
import LoadingScreen from '../components/LoadingScreen';

interface Poll {
  id: string;
  title: string;
  description: string;
  status: string;
  startDate: string;
  endDate: string;
  totalVotes: number;
  isAnonymous: boolean;
  allowMultipleChoices: boolean;
  options: PollOption[];
}

interface PollOption {
  id: string;
  text: string;
  voteCount: number;
  percentage: number;
}

interface Vote {
  id: string;
  pollTitle: string;
  selectedOptions: string[];
  votedAt: string;
  isAnonymous: boolean;
}

const PollsScreen: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'active' | 'completed' | 'my-votes'>('active');
  const [searchQuery, setSearchQuery] = useState('');
  const [refreshing, setRefreshing] = useState(false);
  const [selectedOptions, setSelectedOptions] = useState<{ [pollId: string]: string[] }>({});
  const queryClient = useQueryClient();

  const { data: activePolls, isLoading: activePollsLoading } = useQuery(
    ['polls', 'active', searchQuery],
    () => PollsService.getPolls({ status: 'active', search: searchQuery }),
    {
      enabled: activeTab === 'active',
    }
  );

  const { data: completedPolls, isLoading: completedPollsLoading } = useQuery(
    ['polls', 'completed', searchQuery],
    () => PollsService.getPolls({ status: 'completed', search: searchQuery }),
    {
      enabled: activeTab === 'completed',
    }
  );

  const { data: myVotes, isLoading: myVotesLoading } = useQuery(
    ['my-votes'],
    () => PollsService.getMyVotes(),
    {
      enabled: activeTab === 'my-votes',
    }
  );

  const voteMutation = useMutation(
    ({ pollId, optionIds }: { pollId: string; optionIds: string[] }) =>
      PollsService.vote(pollId, optionIds),
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['polls']);
        queryClient.invalidateQueries(['my-votes']);
        Alert.alert('Success', 'Vote submitted successfully');
        setSelectedOptions({});
      },
      onError: () => {
        Alert.alert('Error', 'Failed to submit vote');
      },
    }
  );

  const onRefresh = async () => {
    setRefreshing(true);
    await queryClient.invalidateQueries();
    setRefreshing(false);
  };

  const handleOptionSelect = (pollId: string, optionId: string, allowMultiple: boolean) => {
    setSelectedOptions(prev => {
      const currentSelections = prev[pollId] || [];
      
      if (allowMultiple) {
        if (currentSelections.includes(optionId)) {
          return {
            ...prev,
            [pollId]: currentSelections.filter(id => id !== optionId)
          };
        } else {
          return {
            ...prev,
            [pollId]: [...currentSelections, optionId]
          };
        }
      } else {
        return {
          ...prev,
          [pollId]: [optionId]
        };
      }
    });
  };

  const handleVote = (poll: Poll) => {
    const selectedOptionIds = selectedOptions[poll.id] || [];
    
    if (selectedOptionIds.length === 0) {
      Alert.alert('Error', 'Please select at least one option');
      return;
    }

    Alert.alert(
      'Confirm Vote',
      `Submit your vote for "${poll.title}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Submit', onPress: () => voteMutation.mutate({ pollId: poll.id, optionIds: selectedOptionIds }) },
      ]
    );
  };

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'active':
        return Colors.success;
      case 'completed':
        return Colors.gray;
      case 'draft':
        return Colors.warning;
      default:
        return Colors.gray;
    }
  };

  const renderPoll = ({ item }: { item: Poll }) => {
    const pollSelections = selectedOptions[item.id] || [];
    const isActive = item.status === 'active';
    const hasVoted = item.status === 'completed' || !isActive;

    return (
      <Card style={styles.card}>
        <Card.Content>
          <View style={styles.cardHeader}>
            <Text style={styles.pollTitle}>{item.title}</Text>
            <Chip 
              mode="outlined" 
              textStyle={styles.chipText}
              style={[styles.statusChip, { backgroundColor: getStatusColor(item.status) }]}
            >
              {item.status.toUpperCase()}
            </Chip>
          </View>
          
          <Text style={styles.pollDescription}>{item.description}</Text>
          
          <View style={styles.pollMeta}>
            <View style={styles.metaItem}>
              <Icon name="schedule" size={16} color={Colors.gray} />
              <Text style={styles.metaText}>
                {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
              </Text>
            </View>
            <View style={styles.metaItem}>
              <Icon name="how-to-vote" size={16} color={Colors.gray} />
              <Text style={styles.metaText}>{item.totalVotes} votes</Text>
            </View>
            {item.isAnonymous && (
              <View style={styles.metaItem}>
                <Icon name="visibility-off" size={16} color={Colors.gray} />
                <Text style={styles.metaText}>Anonymous</Text>
              </View>
            )}
          </View>

          <View style={styles.optionsContainer}>
            {item.options.map((option) => (
              <View key={option.id} style={styles.optionItem}>
                {isActive && !hasVoted ? (
                  <TouchableOpacity
                    style={styles.optionSelector}
                    onPress={() => handleOptionSelect(item.id, option.id, item.allowMultipleChoices)}
                  >
                    {item.allowMultipleChoices ? (
                      <View style={[
                        styles.checkbox,
                        pollSelections.includes(option.id) && styles.checkboxSelected
                      ]}>
                        {pollSelections.includes(option.id) && (
                          <Icon name="check" size={16} color={Colors.white} />
                        )}
                      </View>
                    ) : (
                      <RadioButton
                        value={option.id}
                        status={pollSelections.includes(option.id) ? 'checked' : 'unchecked'}
                        onPress={() => handleOptionSelect(item.id, option.id, false)}
                      />
                    )}
                    <Text style={styles.optionText}>{option.text}</Text>
                  </TouchableOpacity>
                ) : (
                  <View style={styles.optionResult}>
                    <View style={styles.optionHeader}>
                      <Text style={styles.optionText}>{option.text}</Text>
                      <Text style={styles.optionVotes}>
                        {option.voteCount} ({option.percentage}%)
                      </Text>
                    </View>
                    <ProgressBar 
                      progress={option.percentage / 100} 
                      color={Colors.primary}
                      style={styles.progressBar}
                    />
                  </View>
                )}
              </View>
            ))}
          </View>

          {isActive && !hasVoted && (
            <Button
              mode="contained"
              onPress={() => handleVote(item)}
              style={styles.voteButton}
              disabled={pollSelections.length === 0}
              loading={voteMutation.isLoading}
            >
              Submit Vote
            </Button>
          )}
        </Card.Content>
      </Card>
    );
  };

  const renderVote = ({ item }: { item: Vote }) => (
    <Card style={styles.card}>
      <Card.Content>
        <View style={styles.cardHeader}>
          <Text style={styles.voteTitle}>{item.pollTitle}</Text>
          {item.isAnonymous && (
            <Chip 
              mode="outlined" 
              textStyle={styles.chipText}
              style={styles.anonymousChip}
            >
              ANONYMOUS
            </Chip>
          )}
        </View>
        
        <View style={styles.voteDetails}>
          <Text style={styles.voteLabel}>Your selection(s):</Text>
          {item.selectedOptions.map((option, index) => (
            <Text key={index} style={styles.selectedOption}>• {option}</Text>
          ))}
        </View>
        
        <Text style={styles.voteDate}>
          Voted on: {new Date(item.votedAt).toLocaleDateString()}
        </Text>
      </Card.Content>
    </Card>
  );

  if (activePollsLoading || completedPollsLoading || myVotesLoading) {
    return <LoadingScreen />;
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>Polls & Voting</Text>
        <Searchbar
          placeholder="Search polls..."
          onChangeText={setSearchQuery}
          value={searchQuery}
          style={styles.searchbar}
        />
      </View>

      <View style={styles.tabContainer}>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'active' && styles.activeTab]}
          onPress={() => setActiveTab('active')}
        >
          <Icon name="how-to-vote" size={20} color={activeTab === 'active' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'active' && styles.activeTabText]}>
            Active
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'completed' && styles.activeTab]}
          onPress={() => setActiveTab('completed')}
        >
          <Icon name="poll" size={20} color={activeTab === 'completed' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'completed' && styles.activeTabText]}>
            Results
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === 'my-votes' && styles.activeTab]}
          onPress={() => setActiveTab('my-votes')}
        >
          <Icon name="history" size={20} color={activeTab === 'my-votes' ? Colors.white : Colors.gray} />
          <Text style={[styles.tabText, activeTab === 'my-votes' && styles.activeTabText]}>
            My Votes
          </Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={
          activeTab === 'active' ? activePolls?.data || [] :
          activeTab === 'completed' ? completedPolls?.data || [] :
          myVotes?.data || []
        }
        renderItem={
          activeTab === 'my-votes' ? renderVote : renderPoll
        }
        keyExtractor={(item) => item.id}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <FAB
        style={styles.fab}
        icon="add"
        onPress={() => console.log('Navigate to create poll')}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background,
  },
  header: {
    padding: 16,
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: Colors.text,
    marginBottom: 16,
  },
  searchbar: {
    backgroundColor: Colors.lightGray,
    elevation: 0,
  },
  tabContainer: {
    flexDirection: 'row',
    backgroundColor: Colors.white,
    borderBottomWidth: 1,
    borderBottomColor: Colors.lightGray,
  },
  tab: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
    paddingHorizontal: 8,
  },
  activeTab: {
    backgroundColor: Colors.primary,
  },
  tabText: {
    marginLeft: 8,
    fontSize: 14,
    color: Colors.gray,
    fontWeight: '500',
  },
  activeTabText: {
    color: Colors.white,
  },
  listContainer: {
    padding: 16,
  },
  card: {
    marginBottom: 12,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  pollTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  pollDescription: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 12,
    lineHeight: 20,
  },
  pollMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginBottom: 16,
    gap: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  metaText: {
    fontSize: 12,
    color: Colors.gray,
    marginLeft: 4,
  },
  optionsContainer: {
    marginBottom: 16,
  },
  optionItem: {
    marginBottom: 12,
  },
  optionSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 8,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 2,
    borderColor: Colors.primary,
    borderRadius: 4,
    marginRight: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  checkboxSelected: {
    backgroundColor: Colors.primary,
  },
  optionText: {
    fontSize: 14,
    color: Colors.text,
    flex: 1,
  },
  optionResult: {
    marginBottom: 8,
  },
  optionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4,
  },
  optionVotes: {
    fontSize: 12,
    color: Colors.gray,
    fontWeight: '600',
  },
  progressBar: {
    height: 6,
    borderRadius: 3,
  },
  voteButton: {
    marginTop: 8,
  },
  voteTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.text,
    flex: 1,
    marginRight: 8,
  },
  voteDetails: {
    marginBottom: 12,
  },
  voteLabel: {
    fontSize: 14,
    color: Colors.gray,
    marginBottom: 8,
    fontWeight: '600',
  },
  selectedOption: {
    fontSize: 14,
    color: Colors.text,
    marginBottom: 4,
    marginLeft: 8,
  },
  voteDate: {
    fontSize: 12,
    color: Colors.gray,
    fontStyle: 'italic',
  },
  chipText: {
    fontSize: 10,
    color: Colors.white,
  },
  statusChip: {
    height: 24,
  },
  anonymousChip: {
    height: 24,
    backgroundColor: Colors.warning,
  },
  fab: {
    position: 'absolute',
    margin: 16,
    right: 0,
    bottom: 0,
    backgroundColor: Colors.primary,
  },
});

export default PollsScreen;
