export default function HelpPage() {
  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow-lg p-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-8">Help Center</h1>
          
          <div className="space-y-8">
            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Frequently Asked Questions</h2>
              
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I create a group?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Navigate to the Groups page and click &quot;Create New Group&quot;. Fill in the required information including group name, contribution amount, and member details.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I join a group?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    You can join a group by receiving a shared link from an existing member. Click the link and request to join. The group admin will need to approve your request.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I make contributions?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Go to the Contributions page, select your group, and choose &quot;New Contribution&quot;. Enter the amount and payment method to submit your contribution.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I apply for a loan?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Navigate to the Loans page and click &quot;Apply for Loan&quot;. Fill in the loan amount, purpose, and repayment terms. Your request will be reviewed by group admins.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">What are the loan eligibility requirements?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    To be eligible for a loan, you must be an active group member with consistent contributions for at least 3 months and maintain good standing in the group.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I check my loan eligibility?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Use the loan eligibility checker on the Loans page. It will show your maximum eligible loan amount based on your contribution history and group rules.
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do group roles work?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Groups have different roles: Admin (full control), Treasurer (manages finances), Secretary (manages records), and Member (participates in activities).
                  </p>
                </div>

                <div>
                  <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-2">How do I reset my password?</h3>
                  <p className="text-gray-600 dark:text-gray-300">
                    Click &quot;Forgot Password&quot; on the login page. Enter your email address and follow the instructions sent to your email to reset your password.
                  </p>
                </div>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Getting Started Guide</h2>
              <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-6">
                <ol className="list-decimal list-inside space-y-3 text-gray-600 dark:text-gray-300">
                  <li>Create your account and complete your profile</li>
                  <li>Join an existing group or create your own group</li>
                  <li>Make your first contribution to activate your membership</li>
                  <li>Explore group features and connect with other members</li>
                  <li>Apply for loans when you need financial assistance</li>
                </ol>
              </div>
            </section>

            <section>
              <h2 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">Contact Support</h2>
              <p className="text-gray-600 dark:text-gray-300 mb-4">
                If you need additional help, don&apos;t hesitate to reach out to our support team.
              </p>
              <div className="bg-blue-50 dark:bg-blue-900/20 rounded-lg p-4">
                <p className="text-blue-800 dark:text-blue-200">
                  Email: support@villagebanking.com<br />
                  Phone: +260 123 456 789<br />
                  Hours: Monday - Friday, 8:00 AM - 5:00 PM
                </p>
              </div>
            </section>
          </div>
        </div>
      </div>
    </div>
  )
}
