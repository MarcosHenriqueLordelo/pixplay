import { StyleSheet } from "react-native";

const getStyles = (theme: Theme) =>
  StyleSheet.create({
    container: {
      width: "75%",
      padding: 16,
      backgroundColor: theme.colors.action,
      borderRadius: 10,
    },
    headerView: {
      flexDirection: "row",
      justifyContent: "space-between",
      alignItems: "center",
    },
    title: {
      fontSize: theme.font.title.large.size,
      fontWeight: theme.font.title.large.weight,
      letterSpacing: theme.font.title.large.tracking,
      lineHeight: theme.font.title.large.lineHeight,
      color: theme.colors.fontLight,
    },
    input: {
      color: theme.colors.fontDark,
      paddingVertical: 8,
      paddingHorizontal: 16,
      fontSize: theme.font.body.large.size,
      fontWeight: theme.font.body.large.weight,
      letterSpacing: theme.font.body.large.tracking,
      lineHeight: theme.font.body.large.lineHeight,
      backgroundColor: theme.colors.background,
      flex: 1,
      textAlign: "center",
      borderRadius: 6,
    },
    inputContainer: {
      flexDirection: "row",
      marginTop: 16,
      marginBottom: 32,
      alignItems: "center",
    },
    loadingView: {
      position: "absolute",
      width: "100%",
      height: "100%",
    },
    hint: {
      fontSize: theme.font.body.small.size,
      fontWeight: theme.font.body.small.weight,
      letterSpacing: theme.font.body.small.tracking,
      lineHeight: theme.font.body.small.lineHeight,
      color: theme.colors.fontLight,
      textAlign: "center",
      marginTop: 16,
    },
  });

export default getStyles;