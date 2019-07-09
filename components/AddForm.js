import React, { Component } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Input, Item } from 'native-base';
import firebase from 'firebase';

class AddForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: '',
      description: '',
      amount: '',
    };
  }

  onChangeHandler(evt, key) {
    this.setState({
      [key]: evt,
    });
  }

  create = () => {
    // if (this.state.description !== '' && this.state.received !== '') {
    firebase
      .database()
      .ref(this.props.sendEntryFor)
      .push({
        date: this.state.date,
        description: this.state.description,
        amount: this.state.amount,
      });
    // }
    this.props.action();
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={{ fontSize: 25, color: 'white' }}>
            {this.props.sendEntryFor.toUpperCase()} MONEY ENTERY
          </Text>
        </View>
        <View style={styles.middlepart}>
          <Item regular>
            <Input
              placeholder="Date"
              keyboardType="phone-pad"
              onChangeText={evt => this.onChangeHandler(evt, 'date')}
            />
          </Item>

          <Item regular>
            <Input
              placeholder="Description"
              onChangeText={evt => this.onChangeHandler(evt, 'description')}
            />
          </Item>

          <Item regular>
            <Input
              placeholder="Enter Amount"
              keyboardType="numeric"
              onChangeText={evt => this.onChangeHandler(evt, 'amount')}
            />
          </Item>
        </View>
        <View>
          <Button
            style={{ fontSize: 100 }}
            title="SUBMIT"
            color="#00557c"
            onPress={this.create}
          />
        </View>
      </View>
    );
  }
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    elevation: 3,
    backgroundColor: '#00557c',
    justifyContent: 'center',
    alignItems: 'center',
    height: 40,
  },
  middlepart: {
    flex: 4,
    backgroundColor: 'white',
    justifyContent: 'space-around',
  },
});

export default AddForm;
