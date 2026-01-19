'use client'

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { GuideSection } from "@/components/help/GuideSection";
import {
  Users,
  Wallet,
  PiggyBank,
  ShieldCheck,
  Landmark,
  CreditCard,
  FileText,
  UserCog,
  LayoutDashboard,
  Globe
} from "lucide-react";
import { useLanguage } from '@/components/providers/LanguageProvider';
import Image from 'next/image';

export default function HelpPage() {
  const { t } = useLanguage();

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="mb-10 text-center">
          <h1 className="text-4xl font-bold text-gray-900 dark:text-white mb-4">
            {t('help.title')}
          </h1>
          <p className="text-xl text-gray-600 dark:text-gray-300 max-w-2xl mx-auto">
            {t('help.subtitle')}
          </p>
        </div>

        <Tabs defaultValue="members" className="w-full">
          <div className="flex justify-center mb-8">
            <TabsList className="bg-white dark:bg-gray-800 p-1.5 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm flex flex-col sm:flex-row h-auto w-full sm:w-auto">
              <TabsTrigger
                value="members"
                className="rounded-full px-4 py-2 sm:px-6 sm:py-2.5 w-full sm:w-auto data-[state=active]:bg-emerald-600 data-[state=active]:text-white transition-all"
              >
                {t('help.for_members')}
              </TabsTrigger>
              <TabsTrigger
                value="treasurers"
                className="rounded-full px-4 py-2 sm:px-6 sm:py-2.5 w-full sm:w-auto data-[state=active]:bg-teal-600 data-[state=active]:text-white transition-all"
              >
                {t('help.for_treasurers')}
              </TabsTrigger>
              <TabsTrigger
                value="admins"
                className="rounded-full px-4 py-2 sm:px-6 sm:py-2.5 w-full sm:w-auto data-[state=active]:bg-green-600 data-[state=active]:text-white transition-all"
              >
                {t('help.for_admins')}
              </TabsTrigger>
            </TabsList>
          </div>

          <TabsContent value="members" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative w-full h-[200px] md:h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800">
              <Image
                src="/images/help/member-journey.png"
                alt="Member Journey Infographic"
                fill
                className="object-cover"
              />
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GuideSection
                title={t('help.member_section.dashboard_title')}
                icon={LayoutDashboard}
                description={t('help.member_section.dashboard_desc')}
                steps={[
                  { title: t('help.member_section.dashboard_steps.overview'), description: t('help.member_section.dashboard_steps.overview_desc') },
                  { title: t('help.member_section.dashboard_steps.navigation'), description: t('help.member_section.dashboard_steps.navigation_desc') },
                  { title: t('help.member_section.dashboard_steps.notifications'), description: t('help.member_section.dashboard_steps.notifications_desc') }
                ]}
              />

              <GuideSection
                title={t('help.member_section.joining_title')}
                icon={Users}
                description={t('help.member_section.joining_desc')}
                steps={[
                  { title: t('help.member_section.joining_steps.join'), description: t('help.member_section.joining_steps.join_desc') },
                  { title: t('help.member_section.joining_steps.create'), description: t('help.member_section.joining_steps.create_desc') },
                  { title: t('help.member_section.joining_steps.details'), description: t('help.member_section.joining_steps.details_desc') }
                ]}
              />

              <GuideSection
                title={t('help.member_section.contributions_title')}
                icon={PiggyBank}
                description={t('help.member_section.contributions_desc')}
                steps={[
                  { title: t('help.member_section.contributions_steps.select'), description: t('help.member_section.contributions_steps.select_desc') },
                  { title: t('help.member_section.contributions_steps.method'), description: t('help.member_section.contributions_steps.method_desc') },
                  { title: t('help.member_section.contributions_steps.verify'), description: t('help.member_section.contributions_steps.verify_desc') }
                ]}
              />

              <GuideSection
                title={t('help.member_section.loans_title')}
                icon={Wallet}
                description={t('help.member_section.loans_desc')}
                steps={[
                  { title: t('help.member_section.loans_steps.check'), description: t('help.member_section.loans_steps.check_desc') },
                  { title: t('help.member_section.loans_steps.apply'), description: t('help.member_section.loans_steps.apply_desc') },
                  { title: t('help.member_section.loans_steps.wait'), description: t('help.member_section.loans_steps.wait_desc') }
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="treasurers" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative w-full h-[200px] md:h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 mb-8">
              <Image
                src="/images/help/treasurer-workflow.png"
                alt="Treasurer Workflow Infographic"
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-teal-50 dark:bg-teal-900/20 p-6 rounded-xl border border-teal-100 dark:border-teal-800 mb-6">
              <h3 className="text-lg font-semibold text-teal-900 dark:text-teal-100 mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5" />
                {t('help.treasurer_section.responsibilities_title')}
              </h3>
              <p className="text-teal-800 dark:text-teal-200">
                {t('help.treasurer_section.responsibilities_desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GuideSection
                title={t('help.treasurer_section.recording_title')}
                icon={CreditCard}
                description={t('help.treasurer_section.recording_desc')}
                steps={[
                  { title: t('help.treasurer_section.recording_steps.open'), description: t('help.treasurer_section.recording_steps.open_desc') },
                  { title: t('help.treasurer_section.recording_steps.select_member'), description: t('help.treasurer_section.recording_steps.select_member_desc') },
                  { title: t('help.treasurer_section.recording_steps.enter_details'), description: t('help.treasurer_section.recording_steps.enter_details_desc') },
                  { title: t('help.treasurer_section.recording_steps.confirm'), description: t('help.treasurer_section.recording_steps.confirm_desc') }
                ]}
              />

              <GuideSection
                title={t('help.treasurer_section.verifying_title')}
                icon={FileText}
                description={t('help.treasurer_section.verifying_desc')}
                steps={[
                  { title: t('help.treasurer_section.verifying_steps.check'), description: t('help.treasurer_section.verifying_steps.check_desc') },
                  { title: t('help.treasurer_section.verifying_steps.log'), description: t('help.treasurer_section.verifying_steps.log_desc') },
                  { title: t('help.treasurer_section.verifying_steps.discrepancies'), description: t('help.treasurer_section.verifying_steps.discrepancies_desc') }
                ]}
              />
            </div>
          </TabsContent>

          <TabsContent value="admins" className="space-y-8 animate-in slide-in-from-bottom-4 duration-500">
            <div className="relative w-full h-[200px] md:h-[300px] rounded-2xl overflow-hidden shadow-lg border border-gray-100 dark:border-gray-800 mb-8">
              <Image
                src="/images/help/group-success.png"
                alt="Group Success Infographic"
                fill
                className="object-cover"
              />
            </div>

            <div className="bg-green-50 dark:bg-green-900/20 p-6 rounded-xl border border-green-100 dark:border-green-800 mb-6">
              <h3 className="text-lg font-semibold text-green-900 dark:text-green-100 mb-2 flex items-center gap-2">
                <UserCog className="w-5 h-5" />
                {t('help.admin_section.responsibilities_title')}
              </h3>
              <p className="text-green-800 dark:text-green-200">
                {t('help.admin_section.responsibilities_desc')}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-6">
              <GuideSection
                title={t('help.admin_section.member_mgt_title')}
                icon={Users}
                description={t('help.admin_section.member_mgt_desc')}
                steps={[
                  { title: t('help.admin_section.member_mgt_steps.review'), description: t('help.admin_section.member_mgt_steps.review_desc') },
                  { title: t('help.admin_section.member_mgt_steps.manage'), description: t('help.admin_section.member_mgt_steps.manage_desc') },
                  { title: t('help.admin_section.member_mgt_steps.roles'), description: t('help.admin_section.member_mgt_steps.roles_desc') }
                ]}
              />

              <GuideSection
                title={t('help.admin_section.loan_oversight_title')}
                icon={ShieldCheck}
                description={t('help.admin_section.loan_oversight_desc')}
                steps={[
                  { title: t('help.admin_section.loan_oversight_steps.review'), description: t('help.admin_section.loan_oversight_steps.review_desc') },
                  { title: t('help.admin_section.loan_oversight_steps.approve'), description: t('help.admin_section.loan_oversight_steps.approve_desc') },
                  { title: t('help.admin_section.loan_oversight_steps.monitor'), description: t('help.admin_section.loan_oversight_steps.monitor_desc') }
                ]}
              />
            </div>
          </TabsContent>
        </Tabs>

        <div className="mt-12 bg-emerald-50 dark:bg-emerald-900/10 rounded-2xl p-8 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-4">{t('help.need_help_title')}</h2>
          <p className="text-gray-600 dark:text-gray-300 mb-6">
            {t('help.need_help_desc')}
          </p>
          <div className="inline-flex flex-col sm:flex-row gap-4 p-4 bg-white dark:bg-gray-800 rounded-xl shadow-sm w-full sm:w-auto">
            <div className="text-left px-4 pb-4 sm:pb-0 sm:border-r border-b sm:border-b-0 border-gray-200 dark:border-gray-700">
              <div className="text-xs text-gray-500 uppercase font-semibold">{t('help.email_support')}</div>
              <div className="text-emerald-600 font-medium break-all">support@villagebanking.com</div>
            </div>
            <div className="text-left px-4 pt-2 sm:pt-0">
              <div className="text-xs text-gray-500 uppercase font-semibold">{t('help.call_us')}</div>
              <div className="text-emerald-600 font-medium">+265 123 456 789</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
