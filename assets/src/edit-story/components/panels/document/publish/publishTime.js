/*
 * Copyright 2020 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     https://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

/**
 * External dependencies
 */
import styled from 'styled-components';
import { rgba } from 'polished';
import { useCallback, useRef, useState } from 'react';
import { format, formatTime, is12Hour } from '@web-stories-wp/date';
import { __ } from '@web-stories-wp/i18n';

/**
 * Internal dependencies
 */
import { DateTime, Label, Row } from '../../../form';
import Popup from '../../../popup';
import { useStory } from '../../../../app/story';
import { useKeyDownEffect, Icons } from '../../../../../design-system';
import useFocusOut from '../../../../utils/useFocusOut';

const StyledButton = styled.button`
  color: ${({ theme }) => theme.DEPRECATED_THEME.colors.fg.white};
  font-family: ${({ theme }) => theme.DEPRECATED_THEME.fonts.body2.family};
  font-size: ${({ theme }) => theme.DEPRECATED_THEME.fonts.body2.size};
  line-height: ${({ theme }) => theme.DEPRECATED_THEME.fonts.body2.lineHeight};
  letter-spacing: ${({ theme }) =>
    theme.DEPRECATED_THEME.fonts.body2.letterSpacing};
  display: flex;
  flex-direction: row;
  background-color: ${({ theme }) =>
    rgba(theme.DEPRECATED_THEME.colors.fg.white, 0.1)};
  flex: 1;
  padding: 2px;
  border-radius: 4px;
  border-color: transparent;
`;

const DateWrapper = styled.div`
  padding: 5px 0px 5px 2px;
  width: 100%;
  text-align: left;
`;

const FieldLabel = styled(Label)`
  flex-basis: 64px;
`;

const Date = styled.span`
  color: ${({ theme }) => rgba(theme.DEPRECATED_THEME.colors.fg.white, 0.86)};
`;

const Time = styled.span`
  color: ${({ theme }) => rgba(theme.DEPRECATED_THEME.colors.fg.white, 0.4)};
  display: inline-block;
`;

const StyledToggleIcon = styled(Icons.ChevronDownSmall)`
  width: 32px;
  height: auto;
`;

function PublishTime() {
  const { date, updateStory } = useStory(
    ({
      state: {
        story: { date },
      },
      actions: { updateStory },
    }) => ({
      date,
      updateStory,
    })
  );
  const use12HourFormat = is12Hour();

  /* translators: Date format, see https://www.php.net/date */
  const shortDateFormat = __('d/m/Y', 'web-stories');

  const [showDatePicker, setShowDatePicker] = useState(false);
  const dateTimeNode = useRef();
  const dateFieldRef = useRef();

  useKeyDownEffect(
    dateFieldRef,
    { key: ['space', 'enter'] },
    () => {
      setShowDatePicker((val) => !val);
    },
    []
  );

  useFocusOut(dateTimeNode, () => setShowDatePicker(false), [showDatePicker]);

  const handleDateChange = useCallback(
    (value, close = false) => {
      if (close && showDatePicker) {
        setShowDatePicker(false);
      }
      updateStory({ properties: { date: value } });
    },
    [showDatePicker, updateStory]
  );

  return (
    <>
      <Row>
        <FieldLabel>{__('Publish', 'web-stories')}</FieldLabel>
        <StyledButton
          aria-pressed={showDatePicker}
          aria-haspopup
          aria-expanded={showDatePicker}
          aria-label={__('Story publish time', 'web-stories')}
          onClick={(e) => {
            e.preventDefault();
            if (!showDatePicker) {
              // Handle only opening the datepicker since onFocusOut deals with closing.
              setShowDatePicker(true);
            }
          }}
          ref={dateFieldRef}
        >
          <DateWrapper>
            <Date>{format(date, shortDateFormat)}</Date>{' '}
            <Time>{formatTime(date)}</Time>
          </DateWrapper>
          <StyledToggleIcon />
        </StyledButton>
      </Row>
      <Popup
        anchor={dateFieldRef}
        isOpen={showDatePicker}
        placement={'bottom-end'}
        renderContents={({ propagateDimensionChange }) => (
          <DateTime
            value={date}
            onChange={(value, close = false) => {
              handleDateChange(value, close);
            }}
            onViewChange={() => propagateDimensionChange()}
            is12Hour={use12HourFormat}
            forwardedRef={dateTimeNode}
            onClose={() => setShowDatePicker(false)}
          />
        )}
      />
    </>
  );
}

export default PublishTime;
