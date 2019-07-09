import * as React from 'react';
import {
  Text,
  View,
  StyleSheet,
  Image,
  Button,
  ActivityIndicator,
  ScrollView,
  TouchableOpacity,
  Platform,
  StatusBar,
} from 'react-native';
import Constants from 'expo-constants';
import Modal from 'react-native-modal';
import AddForm from './components/AddForm';
import EditForm from './components/EditForm';
import firebase from 'firebase';
import ActionSheet from 'react-native-actionsheet';
import TextTicker from 'react-native-text-ticker';

export default class App extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      isModalVisible: false,
      modalEdit: false,
      isLoading: false,
      received: [],
      expenses: [],
      receivedTotal: 0,
      expensesTotal: 0,
      addEntryFor: '',
      iswhat: '',
      storeID: '',
      storeDate: '',
      storeDescription: '',
      storeAmount: '',
    };
  }

  componentDidMount() {
    const config = {
      apiKey: 'AIzaSyARgWXPPfYdmOTYOwQU-6Nm6ZbF5zV4LGM',
      authDomain: 'cashbook-portfolio.firebaseapp.com',
      databaseURL: 'https://cashbook-portfolio.firebaseio.com',
      projectId: 'cashbook-portfolio',
      storageBucket: 'cashbook-portfolio.appspot.com',
      messagingSenderId: '447508797607',
      appId: '1:447508797607:web:97244815ab7057e9',
    };
    if (!firebase.apps.length) {
      firebase.initializeApp(config);
    }
    this.db = firebase.database();
    this.listenForChange();

    setTimeout(
      function() {
        this.setState({ isLoading: false });
      }.bind(this),
      4000
    );
  }

  listenForChange() {
    this.db
      .ref('received')
      .orderByKey()
      .on('child_added', snapshot => {
        let receivedData = {
          id: snapshot.key,
          date: snapshot.val().date,
          description: snapshot.val().description,
          amount: snapshot.val().amount,
        };

        let received = this.state.received;
        received.push(receivedData);

        this.setState({
          received: received,
          receivedTotal: this.state.received.reduce(
            (sum, received) => sum + +received.amount,
            0
          ),
        });
      });

    this.db
      .ref('received')
      .orderByKey()
      .on('child_removed', snapshot => {
        let received = this.state.received;
        received = received.filter(received => received.id !== snapshot.key);

        this.setState({
          received: received,
          receivedTotal: this.state.received.reduce(
            (sum, received) => sum + +received.amount,
            0
          ),
          isLoading: false,
        });
      });

    this.db
      .ref('received')
      .orderByKey()
      .on('child_changed', snapshot => {
        let receivedData = {
          id: snapshot.key,
          date: snapshot.val().date,
          description: snapshot.val().description,
          amount: snapshot.val().amount,
        };
        let received = this.state.received;

        received = received.filter(received => received.id !== snapshot.key);
        received.push(receivedData);

        this.setState({
          received: received,
        });

        setTimeout(
          function() {
            this.setState({
              receivedTotal: this.state.received.reduce(
                (sum, received) => sum + +received.amount,
                0
              ),
            });
          }.bind(this),
          100
        );
      });

    this.db
      .ref('expenses')
      .orderByKey()
      .on('child_changed', snapshot => {
        let expensesData = {
          id: snapshot.key,
          date: snapshot.val().date,
          description: snapshot.val().description,
          amount: snapshot.val().amount,
        };

        let expenses = this.state.expenses;

        expenses = expenses.filter(expenses => expenses.id !== snapshot.key);
        expenses.push(expensesData);

        this.setState({
          expenses: expenses,
          isLoading: false,
        });

        setTimeout(
          function() {
            this.setState({
              expensesTotal: this.state.expenses.reduce(
                (sum, expenses) => sum + +expenses.amount,
                0
              ),
            });
          }.bind(this),
          100
        );
      });

    this.db
      .ref('expenses')
      .orderByKey()
      .on('child_added', snapshot => {
        let expensesData = {
          id: snapshot.key,
          date: snapshot.val().date,
          description: snapshot.val().description,
          amount: snapshot.val().amount,
        };

        let expenses = this.state.expenses;
        expenses.push(expensesData);

        this.setState({
          expenses: expenses,
          expensesTotal: this.state.expenses.reduce(
            (sum, expenses) => sum + +expenses.amount,
            0
          ),
          isLoading: false,
        });
      });

    this.db
      .ref('expenses')
      .orderByKey()
      .on('child_removed', snapshot => {
        let expenses = this.state.expenses;
        expenses = expenses.filter(expenses => expenses.id !== snapshot.key);

        this.setState({
          expenses: expenses,
          expensesTotal: this.state.expenses.reduce(
            (sum, expenses) => sum + +expenses.amount,
            0
          ),
        });
      });
  }

  addPopupRec = () => {
    this.setState({ isModalVisible: true, addEntryFor: 'received' });
  };

  addPopupExp = () => {
    this.setState({ isModalVisible: true, addEntryFor: 'expenses' });
  };

  popupCancel = () => {
    this.setState({
      isModalVisible: false,
      modalEdit: false,
      receivedTotal: this.state.received.reduce(
        (sum, received) => sum + +received.amount,
        0
      ),
      expensesTotal: this.state.expenses.reduce(
        (sum, expenses) => sum + +expenses.amount,
        0
      ),
    });
  };

  selectList(iswhat, id, date, description, amount) {
    this.setState({
      storeID: id,
      storeDate: date,
      storeDescription: description,
      storeAmount: amount,
    });
    this.ActionSheet.show();
    if (iswhat === undefined) {
      this.setState({ iswhat: 'received' });
    } else if (iswhat !== undefined) {
      this.setState({ iswhat: 'expenses' });
    }
  }

  actionSheetData = index => {
    if (index === 1) {
      firebase
        .database()
        .ref('received')
        .child(this.state.storeID)
        .remove();
      firebase
        .database()
        .ref('expenses')
        .child(this.state.storeID)
        .remove();

      setTimeout(
        function() {
          this.setState({
            receivedTotal: this.state.received.reduce(
              (sum, received) => sum + +received.amount,
              0
            ),
            expensesTotal: this.state.expenses.reduce(
              (sum, expenses) => sum + +expenses.amount,
              0
            ),
          });
        }.bind(this),
        100
      );
    } else if (index === 0) {
      this.setState({ modalEdit: true });
    }
  };

  render() {
    if (this.state.isLoading) {
      return (
        <View
          style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
          <ActivityIndicator size={100} color="#00557c" />
        </View>
      );
    }

    return (
      <View style={styles.container}>
        <View style={styles.header}>
          <Image
            style={{ height: 50, width: 50 }}
            source={require('./assets/icons/school.png')}
          />
          <Text
            style={{
              color: 'white',
              fontSize: 22,
              fontWeight: 'bold',
              paddingLeft: 2,
            }}>
            BASIC CASHBOOK
          </Text>
        </View>

        <View>
          <TextTicker loop bounce style={{ fontSize: 18 }}>
            Made by Brahm Harsh Parmar using react-native and firebase. Source code is available on my github.
          </TextTicker>
        </View>

        <View style={{ flex: 9, flexDirection: 'row' }}>
          <View style={styles.firstpart}>
            <Text style={{ textAlign: 'center', fontSize: 25 }}>RECEIVED</Text>
            <Modal
              isVisible={this.state.isModalVisible}
              animationIn="slideInUp"
              animationInTiming={500}
              onBackButtonPress={this.popupCancel}
              backdropColor="white"
              backdropOpacity={0.9}>
              <View style={{ flex: 1 }}>
                <AddForm
                  sendEntryFor={this.state.addEntryFor}
                  action={this.popupCancel}
                />
              </View>
            </Modal>
            <ScrollView>
              {this.state.received.map((received, index, arr, rec) => (
                <TouchableOpacity
                  onPress={() =>
                    this.selectList(
                      rec,
                      received.id,
                      received.date,
                      received.description,
                      received.amount
                    )
                  }>
                  <View style={styles.Receivedlist} key={received.id}>
                    <View style={styles.listItem}>
                      <View>
                        <Text style={{ fontSize: 16, color: 'white' }}>
                          {received.date}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 15, color: 'white' }}>
                          {received.description}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 16, color: 'white' }}>
                          Rs. {received.amount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>
          <View style={styles.secondpart}>
            <Text style={{ textAlign: 'center', fontSize: 25 }}>SPENT</Text>
            <ScrollView>
              {this.state.expenses.map((expenses, index, arr, exp) => (
                <TouchableOpacity
                  onPress={() =>
                    this.selectList(
                      index,
                      expenses.id,
                      expenses.date,
                      expenses.description,
                      expenses.amount
                    )
                  }>
                  <View style={styles.Expenseslist} key={expenses.id}>
                    <View style={styles.listItem}>
                      <View style={{ flex: 1 }}>
                        <Text style={{ fontSize: 16, color: 'white' }}>
                          {expenses.date}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 15, color: 'white' }}>
                          {expenses.description}
                        </Text>
                      </View>
                      <View style={{ flex: 1 }}>
                        <Text
                          numberOfLines={1}
                          style={{ fontSize: 16, color: 'white' }}>
                          Rs. {expenses.amount}
                        </Text>
                      </View>
                    </View>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          <Modal
            isVisible={this.state.modalEdit}
            animationIn="slideInUp"
            animationInTiming={500}
            onBackButtonPress={this.popupCancel}
            backdropColor="white"
            backdropOpacity={0.9}>
            <View style={{ flex: 1 }}>
              <EditForm
                senduid={this.state.storeID}
                sendDate={this.state.storeDate}
                sendDescription={this.state.storeDescription}
                sendAmount={this.state.storeAmount}
                sendIswhat={this.state.iswhat}
                action={this.popupCancel}
              />
            </View>
          </Modal>
        </View>

        <View style={styles.middleBottom}>
          <View style={{ flex: 1, alignItems: 'center', margin: 1 }}>
            <Text style={{ fontSize: 16, color: 'green', fontWeight: 'bold' }}>
              ₹ {this.state.receivedTotal}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', margin: 1 }}>
            <Text style={{ fontSize: 16, fontWeight: 'bold', color: 'red' }}>
              ₹ {this.state.receivedTotal - this.state.expensesTotal}
            </Text>
          </View>
          <View style={{ flex: 1, alignItems: 'center', margin: 1 }}>
            <Text
              style={{ fontSize: 16, color: '#00557c', fontWeight: 'bold' }}>
              ₹ {this.state.expensesTotal}
            </Text>
          </View>
        </View>

        <View style={styles.bottombar}>
          <Button
            title="   add for received   "
            color="#00557c"
            onPress={this.addPopupRec}
          />
          <Button
            title="     add for spent     "
            color="#00557c"
            onPress={this.addPopupExp}
          />
        </View>
        <View>
          <ActionSheet
            ref={o => (this.ActionSheet = o)}
            title={` Changes for - ${this.state.storeDescription}`}
            options={['Edit', 'Delete', 'Cancel']}
            cancelButtonIndex={2}
            destructiveButtonIndex={1}
            onPress={this.actionSheetData}
          />
        </View>
      </View>
    );
  }
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
    paddingTop: Constants.statusBarHeight,
  },
  header: {
    flex: 1,
    flexDirection: 'row',
    elevation: 5,
    backgroundColor: '#00557c',
    justifyContent: 'flex-start',
    alignItems: 'center',
    height: 40,
  },
  middleBottom: {
    flex: 0.6,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderColor: '#ddd',
    borderTopWidth: 1,
    shadowColor: '#000',
  },
  firstpart: {
    flex: 1,
  },
  secondpart: {
    flex: 1,
  },
  bottombar: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderColor: '#ddd',
    borderTopWidth: 2,
    shadowColor: '#000',
  },
  Receivedlist: {
    marginBottom: 10,
    height: 75,
    elevation: 5,
    backgroundColor: '#408aad',
    marginLeft: 5,
    marginRight: 2,
  },
  Expenseslist: {
    marginBottom: 10,
    height: 75,
    elevation: 5,
    backgroundColor: '#408aad',
    marginRight: 5,
    marginLeft: 2,
  },
  listItem: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'space-around',
  },
});
