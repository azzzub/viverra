import com.kms.katalon.core.annotation.AfterTestCase
import com.kms.katalon.core.context.TestCaseContext

import internal.GlobalVariable
import viverra.ViverraService as ViverraService

class Viverra {
	/**
	 * Executes after every test case ends.
	 * @param testCaseContext related information of the executed test case.
     *
     * After each test cases that have viverra service in it,
     * it will automatically send the report and clear the collection ID
	 */
	@AfterTestCase
	def viverraAfterTestCase(TestCaseContext testCaseContext) {
		def v = new ViverraService()
		if (GlobalVariable.viverraSendReport && GlobalVariable.viverraCollectionID != '') {
			v.sendReport()

			v.clear()
		}
	}
}