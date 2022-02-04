import React, { useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import {
  Box,
  Button,
  Checkbox,
  ContextContainer,
  Divider,
  ImageLoader,
  PageContainer,
  Paper,
} from '@bubbles-ui/components';
import { AdminPageHeader } from '@bubbles-ui/leemons';
import useTranslateLoader from '@multilanguage/useTranslateLoader';
import prefixPN from '@academic-portfolio/helpers/prefixPN';
import { getSettingsRequest, updateSettingsRequest } from '@academic-portfolio/request';
import { useStore } from '@common';
import { activeMenuItemPrograms } from '../../helpers/activeMenuItemPrograms';
import { activeMenuItemSubjects } from '../../helpers/activeMenuItemSubjects';
import { haveProgramsRequest } from '../../request';

// eslint-disable-next-line react/prop-types
function StepCard({ t, step, disabled, to, onClick }) {
  return (
    <Paper>
      <ContextContainer>
        <ImageLoader src="" withPlaceholder height={100} noFlex />
        <ContextContainer title={t(`${step}.title`)} description={t(`${step}.description`)}>
          <Box noFlex>
            <Button as={Link} to={to} fullWidth onClick={onClick} disabled={disabled}>
              {t(`${step}.btn`)}
            </Button>
          </Box>
        </ContextContainer>
      </ContextContainer>
    </Paper>
  );
}

export default function WelcomePage() {
  const [t] = useTranslateLoader(prefixPN('welcome_page'));

  // ----------------------------------------------------------------------
  // SETTINGS
  const [store, render] = useStore();

  const updateSettings = async (data) => {
    store.settings = data;
    await updateSettingsRequest(data);
    render();
  };

  // ·····················································································
  // INIT DATA LOAD

  async function init() {
    const [settingsResponse, haveProgramsResponse] = await Promise.all([
      getSettingsRequest(),
      haveProgramsRequest(),
    ]);
    store.settings = settingsResponse.settings;
    store.havePrograms = haveProgramsResponse.have;
    render();
  }

  useEffect(() => {
    init();
  }, []);

  // ----------------------------------------------------------------------
  // UI CONTROLS

  const handleOnHideHelp = () => {
    const newSettings = { ...store.settings, hideWelcome: !store.settings?.hideWelcome };
    updateSettings(newSettings);
  };

  const handleOnPrograms = async () => {
    await activeMenuItemPrograms();
  };

  const handleOnSubjects = async () => {
    await activeMenuItemSubjects();
  };

  const headerValues = useMemo(
    () => ({
      title: t('page_title'),
      description: t('page_description'),
    }),
    [t]
  );

  return (
    <ContextContainer fullHeight>
      <AdminPageHeader values={headerValues} />
      <PageContainer noFlex>
        <Divider />
      </PageContainer>
      <PageContainer noFlex>
        <Checkbox
          label={t('hide_info_label')}
          onChange={handleOnHideHelp}
          checked={store.settings?.hideWelcome === 1}
          value={store.settings?.hideWelcome === 1}
        />
      </PageContainer>

      <Paper color="solid" shadow="none" padding={0}>
        <PageContainer>
          <ContextContainer direction="row" fullWidth padded="vertical">
            <StepCard
              t={t}
              step="step_programs"
              to="/private/academic-portfolio/programs"
              onClick={handleOnPrograms}
            />
            <StepCard
              t={t}
              step="step_subjects"
              to="/private/academic-portfolio/subjects"
              disabled={!store.havePrograms}
              onClick={handleOnSubjects}
            />
            <StepCard t={t} step="step_tree" to="/private/academic-portfolio/tree" disabled />
          </ContextContainer>
        </PageContainer>
      </Paper>
    </ContextContainer>
  );
}
