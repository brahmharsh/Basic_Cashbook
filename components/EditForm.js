import React, { Component } from 'react';
import { Text, View, StyleSheet, Button } from 'react-native';
import { Input, Item } from 'native-base';
import firebase from 'firebase';

class EditForm extends Component {
  constructor(props) {
    super(props);
    this.state = {
      date: this.props.sendDate,
      description: this.props.sendDescription,
      amount: this.props.sendAmount,
    };
  }

  onChangeHandler(evt, key) {
    this.setState({
      [key]: evt,
    });
  }

  updateSingleData = () => {
    let whichUpdate = `${this.props.sendIswhat}/${this.props.senduid}`;
    firebase
      .database()
      .ref(whichUpdate)
      .update({
        date: this.state.date,
        description: this.state.description,
        amount: this.state.amount,
      });
    this.props.action();
  };

  render() {
    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Text numberOfLines={1} style={{ fontSize: 18, color: 'white' }}>
            {' '}
            EDIT - {this.props.sendDescription}
          </Text>
        </View>
        <View style={styles.middlepart}>
          <Item regular>
            <Input
              placeholder="Date"
              keyboardType="phone-pad"
              onChangeText={evt => this.onChangeHandler(evt, 'date')}
              value={this.state.date}
            />
          </Item>

          <Item regular>
            <Input
              placeholder="Description"
              onChangeText={evt => this.onChangeHandler(evt, 'description')}
              value={this.state.description}
            />
          </Item>

          <Item regular>
            <Input
              placeholder="Enter Amount"
              keyboardType="numeric"
              onChangeText={evt => this.onChangeHandler(evt, 'amount')}
              value={this.state.amount}
            />
          </Item>
        </View>
        <Button
          style={{ fontSize: 100 }}
          title="SUBMIT"
          color="#00557c"
          onPress={this.updateSingleData}
        />
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

export default EditForm;
