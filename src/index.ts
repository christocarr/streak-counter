import { formattedDate } from './utils';
import { Streak, KEY, buildStreak, updateLocalStorageStreak } from './utils';

export function differenceInDays(dateLeft: Date, dateRight: Date): number {
	const diffTime = Math.abs(dateLeft.getTime() - dateRight.getTime());
	const differenceInDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

	return differenceInDays;
}

function shouldIncrementOrResetStreakCount(
	currentDate: Date,
	lastLoginDate: string
): 'increment' | 'reset' | 'none' {
	// We get 11/5/2021
	// so to get 5, we use our helper function
	const difference = differenceInDays(currentDate, new Date(lastLoginDate));
	// This means they logged in the day after the currentDate
	if (difference === 1) {
		return 'increment';
	}

	//same day login
	if (difference === 0) {
		return 'none';
	}
	// Otherwise they logged in after a day, which would
	// break the streak
	return 'reset';
}

export function streakCounter(storage: Storage, date: Date): Streak {
	const streakInLocalStorage = storage.getItem(KEY);
	if (streakInLocalStorage) {
		try {
			const streak = JSON.parse(streakInLocalStorage) as Streak;
			const state = shouldIncrementOrResetStreakCount(date, streak.lastLoginDate);
			const SHOULD_INCREMENT = state === 'increment';
			const SHOULD_RESET = state === 'reset';
			if (SHOULD_INCREMENT) {
				const updatedStreak = buildStreak(date, {
					startDate: streak.startDate,
					currentCount: streak.currentCount + 1,
					lastLoginDate: formattedDate(date),
				});
				updateLocalStorageStreak(storage, updatedStreak);
				return updatedStreak;
			}
			if (SHOULD_RESET) {
				const updatedStreak = buildStreak(date);
				updateLocalStorageStreak(storage, updatedStreak);
				return updatedStreak;
			}
			return streak;
		} catch (error) {
			console.error('Failed to get streak from local storage');
		}
	}

	const streak = buildStreak(date);

	updateLocalStorageStreak(storage, streak);

	return streak;
}
