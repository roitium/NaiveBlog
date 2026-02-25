import json
import subprocess
import time

def run_command(command):
    try:
        result = subprocess.run(
            command,
            shell=True,
            check=True,
            stdout=subprocess.PIPE,
            stderr=subprocess.PIPE,
            text=True
        )
        return result.stdout.strip()
    except subprocess.CalledProcessError as e:
        print(f"Error running command: {command}")
        print(e.stderr)
        return None

def get_open_prs():
    output = run_command("gh pr list --json number,title --limit 100")
    if output:
        return json.loads(output)
    return []

def check_and_merge_pr(pr):
    pr_number = pr['number']
    pr_title = pr['title']
    print(f"Checking PR #{pr_number}: {pr_title}")

    # Get PR details
    pr_details_json = run_command(f"gh pr view {pr_number} --json statusCheckRollup,mergeable")
    if not pr_details_json:
        return

    pr_details = json.loads(pr_details_json)
    
    mergeable = pr_details.get('mergeable')
    if mergeable == 'UNKNOWN':
        print(f"  - Mergeable state UNKNOWN. Waiting a bit...")
        time.sleep(2)
        pr_details_json = run_command(f"gh pr view {pr_number} --json statusCheckRollup,mergeable")
        if pr_details_json:
            pr_details = json.loads(pr_details_json)
            mergeable = pr_details.get('mergeable')

    if mergeable != 'MERGEABLE':
        print(f"  - Skipping: Not mergeable (State: {mergeable})")
        return

    checks = pr_details.get('statusCheckRollup', [])
    
    vercel_success = False
    any_failure = False
    pending_checks = []

    for check in checks:
        if check.get('__typename') == 'CheckRun':
            conclusion = check.get('conclusion')
            status = check.get('status')
            name = check.get('name')
            if conclusion == 'FAILURE':
                print(f"  - Failure found: {name}")
                any_failure = True
            elif status != 'COMPLETED':
                pending_checks.append(name)
        
        if check.get('__typename') == 'StatusContext':
            state = check.get('state')
            context = check.get('context')
            if state in ['FAILURE', 'ERROR']:
                print(f"  - Failure found: {context}")
                any_failure = True
            elif state == 'PENDING':
                pending_checks.append(context)
            
            if context == 'Vercel' and state == 'SUCCESS':
                vercel_success = True

    if any_failure:
        print("  - Skipping: Has failing checks.")
        return

    if pending_checks:
        print(f"  - Skipping: Pending checks: {', '.join(pending_checks)}")
        return

    if not vercel_success:
        print("  - Skipping: Vercel deployment not found or not successful.")
        return

    print("  - All checks passed and Vercel is successful. Merging...")
    merge_result = run_command(f"gh pr merge {pr_number} --squash --delete-branch")
    if merge_result is not None:
        print(f"  - Successfully merged PR #{pr_number}")
    else:
        print(f"  - Failed to merge PR #{pr_number}")

def main():
    print("Starting PR review process...")
    prs = get_open_prs()
    print(f"Found {len(prs)} open PRs.")
    
    for pr in prs:
        check_and_merge_pr(pr)

if __name__ == "__main__":
    main()