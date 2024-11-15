import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import MaterialIcon from '@expo/vector-icons/MaterialIcons';
import moment from 'moment';

import getStyles from './styles';

import IconButton from '../../components/IconButton';
import Spacer from '../../components/Spacer';
import QrCodeScanner from '../../components/QrCodeScanner';
import PropertyListItem from '../../components/PropertyListItem';
import AppBar from '../../components/AppBar';

import useFirebase from '../../contexts/firebase/useFirebase';
import useUser from '../../contexts/user/useUser';
import Loading from '../../components/Loading';
import useUi from '../../contexts/ui/useUi';
import useSnackbar from '../../contexts/snackbar/useSnackbar';
import { StackActions, useNavigation } from '@react-navigation/native';

import DepositModal from '../../modals/DepositModal';
import TransferModal from '../../modals/TransferModal';
import ChargeModal from '../../modals/ChargeModal';
import QrCodeModal from '../../modals/QrCodeModal';
import PaymentModal from '../../modals/PaymentModal';
import ExtractModal from '../../modals/ExtractModal';
import ScoreboardModal from '../../modals/ScoreboardModal';
import CreatePropertyModal from '../../modals/CreatePropertyModal';
import EditPropertyModal from '../../modals/EditProperty';
import OptionsModal from '../../modals/OptionsModal';
import ChangeColorModal from '../../modals/ChangeColorModal';
import ChangeNameModal from '../../modals/ChangeNameModal';
import ShareGameModal from '../../modals/ShareGameModal';

const Game: React.FC = () => {
  const { theme, strings } = useUi();
  const { game, deleteProperty } = useFirebase();
  const { user } = useUser();
  const { showSnackbar } = useSnackbar();
  const navigation = useNavigation();

  const [player, setPlayer] = useState<Player>();
  const [transactions, setTransactions] = useState<Transactions>({});
  const [extract, setExtract] = useState<Transaction[]>([]);
  const [qrCodeData, setQrCodeData] = useState<ChargeQrCode>();
  const [scoreboard, setScoreboard] = useState<Player[]>([]);
  const [players, setPlayers] = useState<Players>();
  const [properties, setProperties] = useState<Property[]>([]);
  const [property, setProperty] = useState<Property>();
  const [transactionsIds, setTransactionsIds] = useState<string[]>([]);

  const [depositModal, setDepositModal] = useState(false);
  const [transferModal, setTransferModal] = useState(false);
  const [chargeModal, setChargeModal] = useState(false);
  const [qrCodeModal, setQrCodeModal] = useState(false);
  const [paymentModal, setPaymentModal] = useState(false);
  const [extractModal, setExtractModal] = useState(false);
  const [scoreboardModal, setScoreboardModal] = useState(false);
  const [createPropertyModal, setCreatePropertyModal] = useState(false);
  const [editPropertyModal, setEditPropertyModal] = useState(false);
  const [optionsModal, setOptionsModal] = useState(false);
  const [changeColorModal, setChangeColorModal] = useState(false);
  const [changeNameModal, setChangeNameModal] = useState(false);
  const [shareGameModal, setShareGameModal] = useState(false);

  const [scanner, setScanner] = useState(false);

  const styles = useMemo(() => getStyles(theme), [theme]);

  useEffect(() => {
    if (!game || !user) return;

    if (game.transactions !== transactions) {
      const ids = handleTransactions(game.transactions, transactionsIds);
      const extractAux = handleExtract(game.transactions);

      setExtract(extractAux);
      setTransactions(game.transactions);
      setTransactionsIds(ids);
    }

    if (game.players !== players) {
      const scoreboardAux = handleScoreboard(game.players);

      setPlayers(game.players);
      setScoreboard(scoreboardAux);
    }

    if (game.players[user.id] !== player) {
      setPlayer(game.players[user.id]);
      if (game.players[user.id].properties) {
        const propertiesAux = handleProperties(
          game.players[user.id].properties
        );
        setProperties(propertiesAux);
      } else {
        setProperties([]);
      }
      setProperty(undefined);
    }
  }, [game, user]);

  const handleGoBack = () => navigation.dispatch(StackActions.popToTop());

  const handleTransactions = (data: Transactions, ids: string[]): string[] => {
    const keys = Object.keys(data);
    const aux = ids;

    const format = new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
    }).format;

    keys.forEach((key) => {
      const transaction = data[key];
      if (transaction.receiver === user!.id) {
        if (!aux.includes(key)) {
          if ((moment().unix() - transaction.timestamp) / 1000 < 0.06)
            showSnackbar(
              `${strings.transferReceived} ${format(transaction.value)}`,
              theme.colors.success
            );
          aux.push(key);
        }
      }
    });

    return aux;
  };

  const handleExtract = (data: Transactions): Transaction[] => {
    const keys = Object.keys(data);
    const extractAux: Transaction[] = [];

    keys.forEach((key) => extractAux.push(data[key]));

    extractAux.sort((a, b) => b.timestamp - a.timestamp);

    return extractAux;
  };

  const handleScoreboard = (data: Players): Player[] => {
    const keys = Object.keys(data);
    const scoreboardAux: Player[] = [];

    keys.forEach((key) => scoreboardAux.push(data[key]));

    scoreboardAux.sort((a, b) => b.money - a.money);

    return scoreboardAux;
  };

  const handleProperties = (data: Properties): Property[] => {
    const keys = Object.keys(data);
    const propertyAux: Property[] = [];

    keys.forEach((key) => propertyAux.push(data[key]));

    return propertyAux;
  };

  const formater = new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });

  const handleQrCodeScanned = (code: string) => {
    if (code.includes('pixplayapp') && code.includes('charge')) {
      setQrCodeData({
        receiver: { id: code.split(':')[2], name: code.split(':')[3] },
        value: parseFloat(code.split(':')[4]),
      });
      setPaymentModal(true);
    } else {
      showSnackbar(strings.invalidQrCode, theme.colors.error);
    }
  };

  const onDeleteProperty = (propertyData: Property) => {
    deleteProperty(propertyData);
  };

  const renderPropertyItem = ({ item: property }: { item: Property }) => (
    <PropertyListItem
      onEdit={() => {
        setProperty(property);
        setEditPropertyModal(true);
      }}
      onQrCode={(data) => {
        setQrCodeData(data);
        setQrCodeModal(true);
      }}
      property={property}
      onDelete={() => onDeleteProperty(property)}
    />
  );

  if (scanner)
    return (
      <QrCodeScanner
        onClose={() => setScanner(false)}
        onQrCodeScanned={handleQrCodeScanned}
      />
    );

  return (
    <View style={styles.container}>
      {!player ? (
        <Loading />
      ) : (
        <View style={styles.container}>
          <AppBar
            title={`${strings.hello} ${user?.name}!`}
            rightActions={[
              { name: 'qr-code', action: () => setShareGameModal(true) },
              { name: 'settings', action: () => setOptionsModal(true) },
            ]}
            leftAction={{
              name: 'arrow-back',
              action: handleGoBack,
            }}
            type="medium"
          />
          <View style={styles.ballanceContainer}>
            <Text style={styles.title}>{strings.balance}</Text>
            <Text style={styles.ballanceValue}>
              {formater.format(player.money)}
            </Text>
          </View>
          <ScrollView
            style={styles.content}
            showsVerticalScrollIndicator={false}
          >
            <ScrollView
              style={styles.buttonsView}
              horizontal
              showsHorizontalScrollIndicator={false}
            >
              <View style={styles.buttonItem}>
                <IconButton
                  name="north"
                  onPress={() => setTransferModal(true)}
                  size={24}
                  color={theme.colors.fontLight}
                  containerSize={56}
                  style={styles.buttonContainer}
                />
                <Text style={styles.buttonLabel}>{strings.transfer}</Text>
              </View>
              <View style={styles.buttonItem}>
                <IconButton
                  name="south"
                  onPress={() => setDepositModal(true)}
                  size={24}
                  color={theme.colors.fontLight}
                  containerSize={56}
                  style={styles.buttonContainer}
                />
                <Text style={styles.buttonLabel}>{strings.deposit}</Text>
              </View>
              <View style={styles.buttonItem}>
                <IconButton
                  name="qr-code-scanner"
                  onPress={() => setScanner(true)}
                  size={24}
                  color={theme.colors.fontLight}
                  containerSize={56}
                  style={styles.buttonContainer}
                />
                <Text style={styles.buttonLabel}>{strings.pay}</Text>
              </View>
              <View style={styles.buttonItem}>
                <IconButton
                  name="attach-money"
                  onPress={() => setChargeModal(true)}
                  size={24}
                  color={theme.colors.fontLight}
                  containerSize={56}
                  style={styles.buttonContainer}
                />
                <Text style={styles.buttonLabel}>{strings.charge}</Text>
              </View>
              <View style={styles.buttonItem}>
                <IconButton
                  name="history"
                  onPress={() => setExtractModal(true)}
                  size={24}
                  color={theme.colors.fontLight}
                  containerSize={56}
                  style={styles.buttonContainer}
                />
                <Text style={styles.buttonLabel}>{strings.extract}</Text>
              </View>
              <Spacer width={16} />
            </ScrollView>
            <TouchableOpacity
              style={styles.scoreboardContainer}
              onPress={() => setScoreboardModal(true)}
            >
              <MaterialIcon
                name="leaderboard"
                size={24}
                color={theme.colors.fontLight}
              />
              <Text style={styles.scoreboardLabel}>{strings.scoreboard}</Text>
            </TouchableOpacity>
            <View style={styles.divider} />
            <View style={styles.rowView}>
              <Text style={styles.title}>{strings.fastCharge}</Text>
              <IconButton
                name="add"
                onPress={() => setCreatePropertyModal(true)}
                size={24}
                color={theme.colors.fontDark}
                style={{ marginRight: 16 }}
              />
            </View>
            <FlatList
              renderItem={renderPropertyItem}
              keyExtractor={(property) => property.id}
              data={properties}
            />
            <Spacer height={32} />
          </ScrollView>
        </View>
      )}
      <DepositModal
        open={depositModal}
        onClose={() => setDepositModal(false)}
      />
      <TransferModal
        open={transferModal}
        onClose={() => setTransferModal(false)}
      />
      <ChargeModal
        open={chargeModal}
        onClose={() => setChargeModal(false)}
        onCharge={(value, receiver) => {
          setQrCodeData({ value, receiver });
          setQrCodeModal(true);
        }}
      />
      <QrCodeModal
        open={qrCodeModal}
        onClose={() => setQrCodeModal(false)}
        qrCodeData={qrCodeData}
      />
      <PaymentModal
        open={paymentModal}
        onClose={() => setPaymentModal(false)}
        qrCodeData={qrCodeData}
      />
      <ExtractModal
        open={extractModal}
        onClose={() => setExtractModal(false)}
        extract={extract}
      />
      <ScoreboardModal
        open={scoreboardModal}
        onClose={() => setScoreboardModal(false)}
        scoreboard={scoreboard}
      />
      <CreatePropertyModal
        open={createPropertyModal}
        onClose={() => setCreatePropertyModal(false)}
      />
      <EditPropertyModal
        onClose={() => setEditPropertyModal(false)}
        open={editPropertyModal}
        property={property}
      />
      <OptionsModal
        inGame
        onClose={() => setOptionsModal(false)}
        open={optionsModal}
        onChangeColor={() => {
          setChangeColorModal(true);
          setOptionsModal(false);
        }}
        onChangeName={() => {
          setChangeNameModal(true);
          setOptionsModal(false);
        }}
      />
      <ChangeColorModal
        onClose={() => {
          setChangeColorModal(false);
          setOptionsModal(true);
        }}
        open={changeColorModal}
      />
      <ChangeNameModal
        onClose={() => {
          setChangeNameModal(false);
          setOptionsModal(true);
        }}
        open={changeNameModal}
      />
      <ShareGameModal
        gameId={game!.id}
        onClose={() => setShareGameModal(false)}
        open={shareGameModal}
      />
    </View>
  );
};

export default Game;
