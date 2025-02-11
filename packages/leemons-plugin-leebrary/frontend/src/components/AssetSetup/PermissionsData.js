import React, { useState, useMemo, useEffect } from 'react';
import PropTypes from 'prop-types';
import { find, isArray, isEmpty, isNil } from 'lodash';
import { useParams } from 'react-router-dom';
import {
  Box,
  Paper,
  ContextContainer,
  Button,
  TableInput,
  Stack,
  Alert,
  Select,
  Title,
  Paragraph,
  Switch,
  UserDisplayItem,
  ImageLoader,
  Text,
} from '@bubbles-ui/components';
import { LibraryItem } from '@bubbles-ui/leemons';
import useTranslateLoader from '@multilanguage/useTranslateLoader';
import SelectUserAgent from '@users/components/SelectUserAgent';
import { addErrorAlert, addSuccessAlert } from '@layout/alert';
import { unflatten, useRequestErrorMessage } from '@common';
import useSessionClasses from '@academic-portfolio/hooks/useSessionClasses';
import { getClassIcon } from '@academic-portfolio/helpers/getClassIcon';
import prefixPN from '../../helpers/prefixPN';
import { prepareAsset } from '../../helpers/prepareAsset';
import { getAssetRequest, setPermissionsRequest } from '../../request';

const ROLES = [
  { label: 'Owner', value: 'owner' },
  { label: 'Viewer', value: 'viewer' },
  { label: 'Editor', value: 'editor' },
  { label: 'Commentor', value: 'commentor' },
];

function ClassItem({ class: klass, ...props }) {
  if (!klass) {
    return null;
  }

  return (
    <Box {...props}>
      <Box
        sx={(theme) => ({
          display: 'flex',
          flexDirection: 'row',
          gap: theme.spacing[2],
          alignItems: 'center',
        })}
      >
        <Box
          sx={() => ({
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            minWidth: 26,
            minHeight: 26,
            maxWidth: 26,
            maxHeight: 26,
            borderRadius: '50%',
            backgroundColor: klass?.color,
          })}
        >
          <ImageLoader
            sx={() => ({
              borderRadius: 0,
              filter: 'brightness(0) invert(1)',
            })}
            forceImage
            width={16}
            height={16}
            src={getClassIcon(klass)}
          />
        </Box>
        <Text>{`${klass.subject.name}${
          klass?.groups?.name ? ` - ${klass.groups.name}` : ''
        }`}</Text>
      </Box>
    </Box>
  );
}
const PermissionsData = ({ asset: assetProp, sharing, onNext = () => {} }) => {
  const [asset, setAsset] = useState(assetProp);
  const [t, translations] = useTranslateLoader(prefixPN('assetSetup'));
  const [loading, setLoading] = useState(false);
  const [usersData, setUsersData] = useState([]);
  const [selectedClasses, setSelectedClasses] = useState([]);
  const [roles, setRoles] = useState([]);
  const [isPublic, setIsPublic] = useState(asset?.public);
  const params = useParams();
  const [, , , getErrorMessage] = useRequestErrorMessage();
  const { data: classes } = useSessionClasses();
  const classesData = useMemo(
    () =>
      classes?.map((klass) => ({
        value: klass.id,
        label: klass.groups.isAlone
          ? klass.subject.name
          : `${klass.subject.name} - ${klass.groups.name}`,
        ...klass,
      })) ?? [],
    [classes]
  );

  // ··············································································
  // DATA PROCESS

  const loadAsset = async (id) => {
    const results = await getAssetRequest(id);
    if (results.asset && results.asset.id !== asset?.id) {
      setAsset(prepareAsset(results.asset));
    }
  };

  const savePermissions = async () => {
    try {
      setLoading(true);
      const canAccess = usersData
        .filter((item) => item.editable !== false)
        .map((userData) => ({
          userAgent: userData.user.value || userData.user.userAgentIds[0],
          role: userData.role,
        }));
      const classesCanAccess = selectedClasses.map((klass) => ({
        class: klass.class[0],
        role: klass.role,
      }));
      await setPermissionsRequest(asset.id, { canAccess, classesCanAccess, isPublic });
      setLoading(false);
      addSuccessAlert(
        sharing
          ? t(`permissionsData.labels.shareSuccess`)
          : t(`permissionsData.labels.permissionsSuccess`)
      );
      onNext();
    } catch (err) {
      setLoading(false);
      addErrorAlert(getErrorMessage(err));
    }
  };

  // ··············································································
  // EFFECTS

  useEffect(() => {
    if (
      !isEmpty(params.asset) &&
      (isNil(asset) || (!isEmpty(asset) && asset.id !== params.asset))
    ) {
      loadAsset(params.asset);
    }
  }, [params]);

  useEffect(() => {
    if (asset?.public !== isPublic) {
      setIsPublic(asset?.public);
    }

    const { canAccess, classesCanAccess } = asset;

    if (isArray(classesCanAccess)) {
      setSelectedClasses(
        classesCanAccess.map((klass) => ({
          class: [klass.class],
          role: klass.role,
        }))
      );
    }
    if (isArray(canAccess)) {
      setUsersData(
        canAccess.map((user) => ({
          user,
          role: user.permissions[0],
          editable: user.permissions[0] !== 'owner',
        }))
      );
    }
  }, [asset]);

  useEffect(() => {
    if (!isEmpty(translations)) {
      const items = unflatten(translations.items);
      const { roleLabels } = items.plugins.leebrary.assetSetup;
      ROLES.forEach((rol, index) => {
        ROLES[index].label = roleLabels[rol.value] || ROLES[index].label;
      });
      setRoles(ROLES);
    }
  }, [translations]);

  // ··············································································
  // HANDLERS

  const handleOnClick = () => {
    savePermissions();
  };

  const checkIfUserIsAdded = (userData) => {
    const found = find(usersData, (data) => data.user.id === userData.user.id);
    return isNil(found);
  };

  const checkIfClassIsAdded = (newClass) => {
    const found = find(
      selectedClasses,
      (selectedClass) => selectedClass.class[0] === newClass.class[0]
    );
    return isNil(found);
  };

  // ··············································································
  // LABELS & STATICS

  const USERS_COLUMNS = useMemo(
    () => [
      {
        Header: 'User',
        accessor: 'user',
        input: {
          node: <SelectUserAgent returnItem />,
          rules: { required: 'Required field' },
        },
        editable: false,
        valueRender: (value) => <UserDisplayItem {...value} variant="inline" size="xs" />,
        style: { width: '50%' },
      },
      {
        Header: 'Role',
        accessor: 'role',
        input: {
          node: <Select />,
          rules: { required: 'Required field' },
          data: roles,
        },
        valueRender: (value) => find(roles, { value })?.label,
      },
    ],
    [roles]
  );

  const USER_LABELS = useMemo(
    () => ({
      add: t('permissionsData.labels.addUserButton', 'Add'),
      remove: t('permissionsData.labels.removeUserButton', 'Remove'),
      edit: t('permissionsData.labels.editUserButton', 'Edit'),
      accept: t('permissionsData.labels.acceptButton', 'Accept'),
      cancel: t('permissionsData.labels.cancelButton', 'Cancel'),
    }),
    [t]
  );

  const CLASSES_COLUMNS = useMemo(
    () => [
      {
        Header: 'Class',
        accessor: 'class',
        input: {
          node: (
            <Select
              itemComponent={(item) => (
                <ClassItem {...item} class={classesData.find((klass) => klass.id === item.value)} />
              )}
              valueComponent={(item) => (
                <ClassItem {...item} class={classesData.find((klass) => klass.id === item.value)} />
              )}
              data={classesData}
            />
          ),
          rules: { required: 'Required field' },
        },
        editable: false,
        valueRender: (values) =>
          values.map((value) => (
            <ClassItem
              key={value}
              class={classesData.find((klass) => klass.id === value)}
              variant="inline"
              size="xs"
            />
          )),
      },
      {
        Header: 'Role',
        accessor: 'role',
        input: {
          node: <Select />,
          rules: { required: 'Required field' },
          data: roles?.filter((role) => ['viewer', 'editor'].includes(role.value)),
        },
        valueRender: (value) => find(roles, { value })?.label,
      },
    ],
    [roles, classesData]
  );

  // ··············································································
  // RENDER

  return (
    <Box>
      {!isEmpty(asset) && (
        <ContextContainer
          title={
            sharing ? t('permissionsData.header.shareTitle') : t('permissionsData.labels.title')
          }
        >
          <Paper bordered padding={1} shadow="none">
            <LibraryItem asset={asset} />
          </Paper>
          {isArray(asset?.canAccess) ? (
            <ContextContainer divided>
              <Box>
                <Switch
                  checked={isPublic}
                  onChange={setIsPublic}
                  label={t('permissionsData.labels.isPublic')}
                />
              </Box>

              {!isPublic && (
                <>
                  <ContextContainer>
                    <Box>
                      <Title order={5}>{t('permissionsData.labels.addClasses')}</Title>
                      <Paragraph>{t('permissionsData.labels.addClassesDescription')}</Paragraph>
                    </Box>
                    {!isEmpty(USERS_COLUMNS) && !isEmpty(USER_LABELS) && (
                      <TableInput
                        data={selectedClasses}
                        onChange={setSelectedClasses}
                        columns={CLASSES_COLUMNS}
                        labels={USER_LABELS}
                        showHeaders={false}
                        forceShowInputs
                        sortable={false}
                        onBeforeAdd={checkIfClassIsAdded}
                        resetOnAdd
                        editable
                        unique
                      />
                    )}
                  </ContextContainer>
                  <ContextContainer>
                    <Box>
                      <Title order={5}>{t('permissionsData.labels.addUsers')}</Title>
                      <Paragraph>{t('permissionsData.labels.addUsersDescription')}</Paragraph>
                    </Box>
                    {!isEmpty(USERS_COLUMNS) && !isEmpty(USER_LABELS) && (
                      <TableInput
                        data={usersData}
                        onChange={setUsersData}
                        columns={USERS_COLUMNS}
                        labels={USER_LABELS}
                        showHeaders={false}
                        forceShowInputs
                        sortable={false}
                        onBeforeAdd={checkIfUserIsAdded}
                        resetOnAdd
                        editable
                        unique
                      />
                    )}
                  </ContextContainer>
                </>
              )}
              <Stack justifyContent={'end'} fullWidth>
                <Button loading={loading} onClick={handleOnClick}>
                  {sharing
                    ? t('permissionsData.labels.shareButton')
                    : t('permissionsData.labels.saveButton')}
                </Button>
              </Stack>
            </ContextContainer>
          ) : (
            <Alert severity="error" closeable={false}>
              {t('permissionsData.errorMessages.share')}
            </Alert>
          )}
        </ContextContainer>
      )}
    </Box>
  );
};

PermissionsData.propTypes = {
  asset: PropTypes.object,
  loading: PropTypes.bool,
  sharing: PropTypes.bool,
  onNext: PropTypes.func,
};

export default PermissionsData;
export { PermissionsData };
