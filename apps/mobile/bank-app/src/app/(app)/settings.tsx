/* eslint-disable react/react-in-jsx-scope */
import { Env } from '@env';
import { useColorScheme } from 'nativewind';

import { Item } from '@/components/settings/item';
import { ItemsContainer } from '@/components/settings/items-container';
import { LanguageItem } from '@/components/settings/language-item';
import { ThemeItem } from '@/components/settings/theme-item';
import {
  colors,
  FocusAwareStatusBar,
  ScrollView,
  Text,
  View,
} from '@/components/ui';
import { Github, Rate, Share, Support, Website } from '@/components/ui/icons';
import { translate, useAuth } from '@/lib';

export default function Settings() {
  const signOut = useAuth.use.signOut();
  const { colorScheme } = useColorScheme();
  const iconColor =
    colorScheme === 'dark' ? colors.neutral[300] : colors.neutral[600];

  return (
    <>
      <FocusAwareStatusBar />
      <ScrollView>
        <View className="flex-1 bg-white px-4 pt-16 dark:bg-charcoal-950">
          <Text className="mb-4 text-xl font-bold text-neutral-800 dark:text-neutral-100">
            {translate('settings.title')}
          </Text>

          <ItemsContainer title="settings.generale" className="mb-6">
            <LanguageItem />
            <ThemeItem />
          </ItemsContainer>

          <ItemsContainer title="settings.about" className="mb-6">
            <Item text="settings.app_name" value={Env.NAME} />
            <Item text="settings.version" value={Env.VERSION} />
          </ItemsContainer>

          <ItemsContainer title="settings.support_us" className="mb-6">
            <Item
              text="settings.share"
              icon={<Share color={iconColor} />}
              onPress={() => {}}
              className="hover:bg-neutral-50 dark:hover:bg-charcoal-900"
            />
            <Item
              text="settings.rate"
              icon={<Rate color={iconColor} />}
              onPress={() => {}}
              className="hover:bg-neutral-50 dark:hover:bg-charcoal-900"
            />
            <Item
              text="settings.support"
              icon={<Support color={iconColor} />}
              onPress={() => {}}
              className="hover:bg-neutral-50 dark:hover:bg-charcoal-900"
            />
          </ItemsContainer>

          <ItemsContainer title="settings.links" className="mb-6">
            <Item
              text="settings.privacy"
              onPress={() => {}}
              className="hover:bg-neutral-50 dark:hover:bg-charcoal-900"
            />
            <Item
              text="settings.terms"
              onPress={() => {}}
              className="hover:bg-neutral-50 dark:hover:bg-charcoal-900"
            />
            <Item
              text="settings.github"
              icon={<Github color={iconColor} />}
              onPress={() => {}}
              className="hover:bg-neutral-50 dark:hover:bg-charcoal-900"
            />
            <Item
              text="settings.website"
              icon={<Website color={iconColor} />}
              onPress={() => {}}
              className="hover:bg-neutral-50 dark:hover:bg-charcoal-900"
            />
          </ItemsContainer>

          <View className="my-8">
            <ItemsContainer>
              <Item
                text="settings.logout"
                onPress={signOut}
                className="hover:bg-red-50 dark:hover:bg-red-900/20"
              />
            </ItemsContainer>
          </View>
        </View>
      </ScrollView>
    </>
  );
}
